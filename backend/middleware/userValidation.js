const mongoose = require('mongoose');
const { createHttpError } = require('../utils/errorHelpers');

const parseAllowedUpdates = (updates) => {
    const allowedUpdates = ['fullname', 'bio', 'avatar', 'coverImage'];
    const result = {};

    Object.keys(updates || {}).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            result[key] = updates[key];
        }
    });

    return result;
};

const validateUsernameParam = (req, res, next) => {
    const username = typeof req.params.username === 'string' ? req.params.username.trim() : '';

    if (!username) {
        return next(createHttpError('Username is required', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        username,
    };

    next();
};

const validateRegisterBody = (req, res, next) => {
    const { username, fullname, email, password, confirmPassword, avatar } = req.body;

    if (!username || !fullname || !password || !confirmPassword) {
        return next(createHttpError('Missing fields', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        username,
        fullname,
        email,
        password,
        confirmPassword,
        avatar,
    };

    next();
};

const validateLoginBody = (req, res, next) => {
    const identifier = req.body.identifier || req.body.username || req.body.email;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return next(createHttpError('Vui lòng nhập tên đăng nhập hoặc email', 400));
    }

    if (typeof req.body.password !== 'string' || !req.body.password) {
        return next(createHttpError('Mật khẩu là bắt buộc', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        identifier: identifier.trim(),
        username: identifier.trim(),
        password: req.body.password,
    };

    next();
};

const validateRefreshTokenBody = (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(createHttpError('No refresh token', 401));
    }

    req.validated = {
        ...(req.validated || {}),
        refreshToken,
    };

    next();
};

const validateUpdateUserBody = (req, res, next) => {
    const updates = parseAllowedUpdates(req.body);

    req.validated = {
        ...(req.validated || {}),
        updates,
    };

    next();
};

const validateUserIdParam = (req, res, next) => {
    const userId = req.params.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(createHttpError('Invalid userId', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        userId,
    };

    next();
};

const validateForgotPasswordBody = (req, res, next) => {
    const identifier = req.body.identifier || req.body.email || req.body.username;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return next(createHttpError('Vui lòng nhập email hoặc tên đăng nhập', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        identifier: identifier.trim(),
    };

    next();
};

const validateVerifyOtpBody = (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
        return next(createHttpError('Email là bắt buộc', 400));
    }

    if (!otp || !String(otp).trim()) {
        return next(createHttpError('Mã OTP là bắt buộc', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        email: email.trim().toLowerCase(),
        otp: String(otp).trim(),
    };

    next();
};

const validateResetPasswordBody = (req, res, next) => {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword || !confirmPassword) {
        return next(createHttpError('Vui lòng điền đầy đủ tất cả các trường', 400));
    }

    if (newPassword !== confirmPassword) {
        return next(createHttpError('Mật khẩu xác nhận không khớp', 400));
    }

    if (newPassword.length < 6) {
        return next(createHttpError('Mật khẩu mới phải có ít nhất 6 ký tự', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        email: email.trim().toLowerCase(),
        resetToken: String(resetToken).trim(),
        newPassword,
        confirmPassword,
    };

    next();
};

module.exports = {
    validateUsernameParam,
    validateRegisterBody,
    validateLoginBody,
    validateRefreshTokenBody,
    validateUpdateUserBody,
    validateUserIdParam,
    validateForgotPasswordBody,
    validateVerifyOtpBody,
    validateResetPasswordBody,
};
