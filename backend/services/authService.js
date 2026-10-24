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

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw createHttpError('User already exists', 400);
    }

    if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            throw createHttpError('Email đã được sử dụng bởi tài khoản khác', 400);
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        fullname,
        email: email ? email.trim().toLowerCase() : undefined,
        password: hashedPassword,
        avatar: avatar || undefined,
    });

    await newUser.save();

    const safeUser = await User.findById(newUser._id).select(SAFE_USER_SELECT);

    return {
        message: 'User registered successfully',
        user: safeUser,
    };
};

const login = async ({ username, password }) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw createHttpError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw createHttpError('Invalid password', 401);
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
        throw createHttpError('Token expired or invalid', 403);
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== inputRefreshToken) {
        throw createHttpError('Invalid refresh token', 403);
    }

    return {
        accessToken: generateAccessToken(user._id),
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
        console.error('❌ Lỗi gửi email qua Nodemailer:', mailErr.message);
        throw createHttpError('Không thể gửi email lúc này. Vui lòng kiểm tra lại cấu hình EMAIL_USER và EMAIL_PASS hoặc thử lại sau.', 500);
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

module.exports = {
    register,
    login,
    refreshToken,
    forgotPassword,
    verifyOtp,
    resetPassword,
};
