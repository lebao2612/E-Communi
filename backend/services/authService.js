const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { createHttpError } = require('../utils/errorHelpers');
const { sendOtpEmail } = require('./emailService');

const SAFE_USER_SELECT = '-password -refreshToken';

const register = async ({ username, fullname, email, password, confirmPassword, avatar }) => {
    if (password !== confirmPassword) {
        throw createHttpError('Passwords do not match', 400);
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
        throw createHttpError('Email là bắt buộc', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        throw createHttpError('Định dạng email không hợp lệ', 400);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw createHttpError('Tên đăng nhập đã tồn tại', 400);
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
        throw createHttpError('Email đã được sử dụng bởi tài khoản khác', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        fullname,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || undefined,
        isEmailVerified: false,
    });

    try {
        await newUser.save();
    } catch (err) {
        // Bắt lỗi duplicate key từ MongoDB (race condition safety net)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0];
            if (field === 'email') {
                throw createHttpError('Email đã được sử dụng bởi tài khoản khác', 400);
            }
            if (field === 'username') {
                throw createHttpError('Tên đăng nhập đã tồn tại', 400);
            }
            throw createHttpError('Thông tin đăng ký bị trùng lặp', 400);
        }
        throw err;
    }

    // Tạo mã OTP 6 số để kích hoạt tài khoản
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await Otp.deleteMany({ email: cleanEmail, type: 'VERIFY_EMAIL' });
    await Otp.create({
        email: cleanEmail,
        otp: hashedOtp,
        type: 'VERIFY_EMAIL',
    });

    // Gửi email kích hoạt OTP (bọc try-catch để nếu lỗi mail không làm hỏng tài khoản)
    try {
        await sendOtpEmail(cleanEmail, otpCode, fullname, 'VERIFY_EMAIL');
    } catch (mailError) {
        console.error('[Register] Failed to send verification OTP email:', mailError.message);
    }

    const safeUser = await User.findById(newUser._id).select(SAFE_USER_SELECT);

    return {
        message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để nhận mã OTP kích hoạt.',
        requireEmailVerification: true,
        email: cleanEmail,
        user: safeUser,
    };
};

const login = async ({ identifier, username, password }) => {
    const loginId = (identifier || username || '').trim();
    if (!loginId) {
        throw createHttpError('Vui lòng cung cấp tên đăng nhập hoặc email', 400);
    }

    const user = await User.findOne({
        $or: [
            { username: loginId },
            { email: loginId.toLowerCase() }
        ]
    });

    if (!user) {
        throw createHttpError('Tài khoản không tồn tại', 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw createHttpError('Mật khẩu không chính xác', 401);
    }

    // Kiểm tra tài khoản đã kích hoạt email chưa (ngoại trừ tài khoản đăng nhập Google)
    if (user.authProvider !== 'google' && user.isEmailVerified === false) {
        throw createHttpError('Tài khoản của bạn chưa được kích hoạt qua email. Vui lòng xác thực mã OTP để tiếp tục.', 403, {
            requireEmailVerification: true,
            email: user.email,
        });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return {
        accessToken,
        refreshToken,
    };
};

const refreshToken = async (inputRefreshToken) => {
    let payload;
    try {
        payload = jwt.verify(inputRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw createHttpError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 403);
    }

    const user = await User.findById(payload.userId);
    if (!user) {
        throw createHttpError('Tài khoản không tồn tại', 404);
    }

    // Token Reuse Detection (Phát hiện tấn công phát lại / đánh cắp token):
    // Nếu token gửi lên không khớp với token đang lưu trong DB của user,
    // chứng tỏ token cũ đã bị sử dụng lại sau khi đã xoay vòng.
    if (user.refreshToken !== inputRefreshToken) {
        // Thu hồi toàn bộ phiên của tài khoản để bảo vệ người dùng
        user.refreshToken = null;
        await user.save();
        throw createHttpError('Phát hiện token đã bị thu hồi hoặc phiên bị can thiệp. Vui lòng đăng nhập lại.', 403);
    }

    // Cơ chế Refresh Token Rotation: cấp cặp token mới toanh
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const logout = async (inputRefreshToken) => {
    if (inputRefreshToken) {
        try {
            const payload = jwt.verify(inputRefreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (payload?.userId) {
                await User.findByIdAndUpdate(payload.userId, { refreshToken: null });
            }
        } catch {
            // Token hết hạn hoặc không hợp lệ thì vẫn tiếp tục hủy phiên
        }
    }
    return {
        message: 'Đăng xuất thành công',
    };
};

const forgotPassword = async (identifier) => {
    if (!identifier || typeof identifier !== 'string') {
        throw createHttpError('Vui lòng cung cấp email hoặc tên đăng nhập', 400);
    }
    const cleanId = identifier.trim();
    const user = await User.findOne({
        $or: [
            { email: cleanId.toLowerCase() },
            { username: cleanId }
        ]
    });

    if (!user) {
        throw createHttpError('Không tìm thấy tài khoản với thông tin đã nhập', 404);
    }

    if (!user.email || !user.email.includes('@')) {
        throw createHttpError('Tài khoản này chưa liên kết email. Vui lòng liên hệ quản trị viên để được hỗ trợ.', 400);
    }

    // Tạo mã OTP ngẫu nhiên 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Xóa OTP cũ nếu có
    await Otp.deleteMany({ email: user.email.toLowerCase(), type: 'FORGOT_PASSWORD' });

    // Lưu OTP mới (tự động hết hạn sau 10 phút)
    await Otp.create({
        email: user.email.toLowerCase(),
        otp: hashedOtp,
        type: 'FORGOT_PASSWORD',
    });

    // Gửi email chứa OTP
    try {
        await sendOtpEmail(user.email, otpCode, user.fullname);
    } catch (mailErr) {
        console.error('❌ Lỗi gửi email OTP:', mailErr.message);
        throw createHttpError(`Không thể gửi email: ${mailErr.message || 'Lỗi dịch vụ email'}. Vui lòng thử lại sau.`, 500);
    }

    // Mask email để trả về cho Frontend (ví dụ: b***@gmail.com)
    const [userPart, domainPart] = user.email.split('@');
    const maskedUserPart = userPart.length > 2 
        ? userPart[0] + '*'.repeat(userPart.length - 2) + userPart[userPart.length - 1]
        : userPart[0] + '*';
    const maskedEmail = `${maskedUserPart}@${domainPart}`;

    return {
        message: 'Mã xác nhận OTP đã được gửi đến email của bạn',
        email: user.email,
        maskedEmail,
    };
};

const verifyOtp = async ({ email, otp }) => {
    if (!email || !otp) {
        throw createHttpError('Vui lòng nhập đầy đủ email và mã OTP', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({
        email: cleanEmail,
        type: 'FORGOT_PASSWORD'
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        throw createHttpError('Mã OTP không tồn tại hoặc đã hết hạn (sau 10 phút)', 400);
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), otpRecord.otp);
    if (!isMatch) {
        throw createHttpError('Mã OTP không chính xác. Vui lòng kiểm tra lại', 400);
    }

    // Ký 1 resetToken tạm thời có hạn 10 phút
    const resetToken = jwt.sign(
        { email: cleanEmail, purpose: 'PASSWORD_RESET' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
    );

    return {
        message: 'Xác thực OTP thành công',
        resetToken,
    };
};

const resetPassword = async ({ email, resetToken, newPassword, confirmPassword }) => {
    if (!email || !resetToken || !newPassword || !confirmPassword) {
        throw createHttpError('Vui lòng điền đầy đủ các thông tin', 400);
    }

    if (newPassword !== confirmPassword) {
        throw createHttpError('Mật khẩu xác nhận không khớp', 400);
    }

    if (newPassword.length < 6) {
        throw createHttpError('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Xác thực resetToken
    let payload;
    try {
        payload = jwt.verify(resetToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw createHttpError('Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại từ đầu', 403);
    }

    if (payload.purpose !== 'PASSWORD_RESET' || payload.email !== cleanEmail) {
        throw createHttpError('Token đặt lại mật khẩu không hợp lệ', 403);
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        throw createHttpError('Người dùng không tồn tại', 404);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshToken = null; // Hủy phiên đăng nhập cũ
    await user.save();

    // Xóa sạch OTP
    await Otp.deleteMany({ email: cleanEmail });

    return {
        message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới',
    };
};

/**
 * Xác thực Google ID Token qua Google API endpoint
 */
const verifyGoogleToken = async (idToken) => {
    if (!idToken || typeof idToken !== 'string') {
        throw createHttpError('Google ID Token là bắt buộc', 400);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let googleData;
    try {
        const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken.trim()), {
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('[Google OAuth] tokeninfo verification failed:', response.status, errorDetails);
            throw createHttpError('Mã xác thực Google không hợp lệ hoặc đã hết hạn', 401);
        }

        googleData = await response.json();
    } catch (err) {
        if (err.name === 'AbortError') {
            throw createHttpError('Kết nối xác thực Google bị quá thời gian. Vui lòng thử lại.', 504);
        }
        throw err.statusCode ? err : createHttpError('Không thể xác thực tài khoản Google lúc này', 500);
    } finally {
        clearTimeout(timeoutId);
    }

    const isEmailVerified = googleData.email_verified === 'true' || googleData.email_verified === true;
    if (!googleData.email || !isEmailVerified) {
        throw createHttpError('Email Google chưa được xác thực', 400);
    }

    const configuredClientId = process.env.GOOGLE_CLIENT_ID?.trim().replace(/^["']|["']$/g, '');
    if (configuredClientId && googleData.aud !== configuredClientId) {
        console.error('[Google OAuth] Client ID mismatch:', {
            tokenAud: googleData.aud,
            configuredClientId,
        });
        throw createHttpError('Token Google không khớp với ứng dụng', 401);
    }

    return {
        email: googleData.email.trim().toLowerCase(),
        fullname: googleData.name || googleData.given_name || 'Người dùng Google',
        avatar: googleData.picture || undefined,
        googleId: googleData.sub,
    };
};

/**
 * Xử lý Đăng nhập Google (TH1: đã có tài khoản, TH2: chưa có tài khoản)
 */
const googleLogin = async (idToken) => {
    const googleProfile = await verifyGoogleToken(idToken);
    const { email, fullname, avatar, googleId } = googleProfile;

    let user = await User.findOne({ email });

    // TH1: ĐÃ CÓ TÀI KHOẢN TRONG HỆ THỐNG -> ĐĂNG NHẬP VÀO THẲNG
    if (user) {
        let isModified = false;
        if (!user.googleId) {
            user.googleId = googleId;
            isModified = true;
        }
        if (!user.avatar && avatar) {
            user.avatar = avatar;
            isModified = true;
        }
        if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            isModified = true;
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        const safeUser = await User.findById(user._id).select(SAFE_USER_SELECT);

        return {
            isNewUser: false,
            message: 'Đăng nhập Google thành công',
            accessToken,
            refreshToken,
            user: safeUser,
        };
    }

    // TH2: CHƯA CÓ TÀI KHOẢN -> CẤP SETUP TOKEN ĐỂ HOÀN TẤT PROFILE
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 15) || 'user';
    let suggestedUsername = baseUsername;
    const existingUsername = await User.findOne({ username: suggestedUsername });
    if (existingUsername) {
        suggestedUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const googleSetupToken = jwt.sign(
        {
            email,
            fullname,
            avatar,
            googleId,
            purpose: 'GOOGLE_SETUP',
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    return {
        isNewUser: true,
        message: 'Vui lòng hoàn tất thông tin tài khoản để tham gia BChat',
        googleSetupToken,
        defaultInfo: {
            email,
            fullname,
            avatar,
            suggestedUsername,
        },
    };
};

/**
 * Hoàn tất đăng ký tài khoản từ Google (TH2)
 */
const googleCompleteRegistration = async ({ googleSetupToken, username, fullname, bio }) => {
    if (!googleSetupToken) {
        throw createHttpError('Thiếu token xác thực Google', 400);
    }

    let payload;
    try {
        payload = jwt.verify(googleSetupToken, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw createHttpError('Phiên đăng ký Google đã hết hạn. Vui lòng bấm đăng nhập Google lại', 403);
    }

    if (payload.purpose !== 'GOOGLE_SETUP' || !payload.email || !payload.googleId) {
        throw createHttpError('Token đăng ký Google không hợp lệ', 403);
    }

    if (!username || typeof username !== 'string') {
        throw createHttpError('Tên đăng nhập (username) là bắt buộc', 400);
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(cleanUsername)) {
        throw createHttpError('Tên đăng nhập phải từ 3 đến 30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới', 400);
    }

    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
        throw createHttpError('Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác', 400);
    }

    const existingEmail = await User.findOne({ email: payload.email });
    if (existingEmail) {
        throw createHttpError('Email này đã được kích hoạt tài khoản. Vui lòng đăng nhập lại.', 400);
    }

    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = new User({
        username: cleanUsername,
        fullname: (fullname || payload.fullname || cleanUsername).trim(),
        email: payload.email,
        password: hashedPassword,
        avatar: payload.avatar || undefined,
        bio: (bio || '').trim(),
        googleId: payload.googleId,
        authProvider: 'google',
        isEmailVerified: true,
    });

    try {
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) {
            throw createHttpError('Thông tin đăng ký (username hoặc email) đã tồn tại', 400);
        }
        throw err;
    }

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const safeUser = await User.findById(newUser._id).select(SAFE_USER_SELECT);

    return {
        message: 'Hoàn tất đăng ký tài khoản thành công',
        accessToken,
        refreshToken,
        user: safeUser,
    };
};

/**
 * Xác thực mã OTP để kích hoạt email đăng ký (Task 1.4)
 */
const verifyEmailOtp = async ({ email, otp }) => {
    if (!email || !otp) {
        throw createHttpError('Vui lòng cung cấp đầy đủ email và mã OTP', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
        throw createHttpError('Mã OTP phải bao gồm 6 chữ số', 400);
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        throw createHttpError('Không tìm thấy tài khoản với email này', 404);
    }

    if (user.isEmailVerified) {
        throw createHttpError('Tài khoản này đã được kích hoạt trước đó. Vui lòng đăng nhập.', 400);
    }

    const latestOtp = await Otp.findOne({
        email: cleanEmail,
        type: 'VERIFY_EMAIL',
    }).sort({ createdAt: -1 });

    if (!latestOtp) {
        throw createHttpError('Mã xác nhận đã hết hạn hoặc không tồn tại. Vui lòng bấm gửi lại mã mới.', 400);
    }

    const isMatch = await bcrypt.compare(cleanOtp, latestOtp.otp);
    if (!isMatch) {
        throw createHttpError('Mã OTP không chính xác. Vui lòng kiểm tra lại.', 400);
    }

    // Kích hoạt tài khoản
    user.isEmailVerified = true;

    // Tự động cấp phiên đăng nhập luôn
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // Xóa OTP kích hoạt đã dùng
    await Otp.deleteMany({ email: cleanEmail, type: 'VERIFY_EMAIL' });

    const safeUser = await User.findById(user._id).select(SAFE_USER_SELECT);

    return {
        message: 'Kích hoạt tài khoản thành công! Chào mừng bạn đến với BChat.',
        accessToken,
        refreshToken,
        user: safeUser,
    };
};

/**
 * Gửi lại mã OTP kích hoạt tài khoản
 */
const resendVerificationOtp = async ({ email }) => {
    if (!email || typeof email !== 'string' || !email.trim()) {
        throw createHttpError('Vui lòng cung cấp địa chỉ email', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
        throw createHttpError('Không tìm thấy tài khoản với email này', 404);
    }

    if (user.isEmailVerified) {
        throw createHttpError('Tài khoản này đã được kích hoạt trước đó. Vui lòng đăng nhập.', 400);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await Otp.deleteMany({ email: cleanEmail, type: 'VERIFY_EMAIL' });
    await Otp.create({
        email: cleanEmail,
        otp: hashedOtp,
        type: 'VERIFY_EMAIL',
    });

    try {
        await sendOtpEmail(cleanEmail, otpCode, user.fullname || user.username, 'VERIFY_EMAIL');
    } catch (mailError) {
        console.error('[Resend Verification] Failed to send email:', mailError.message);
        throw createHttpError('Không thể gửi email lúc này. Vui lòng thử lại sau ít phút.', 500);
    }

    return {
        message: 'Mã xác nhận OTP mới đã được gửi tới email của bạn.',
        email: cleanEmail,
    };
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleLogin,
    googleCompleteRegistration,
    verifyEmailOtp,
    resendVerificationOtp,
};
