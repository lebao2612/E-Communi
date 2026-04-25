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
    const { username, fullname, password, confirmPassword, avatar } = req.body;

    if (!username || !fullname || !password || !confirmPassword) {
        return next(createHttpError('Missing fields', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        username,
        fullname,
        password,
        confirmPassword,
        avatar,
    };

    next();
};

const validateLoginBody = (req, res, next) => {
    const { username, password } = req.body;

    if (!username) {
        return next(createHttpError('Username is required', 400));
    }

    if (typeof password !== 'string' || !password) {
        return next(createHttpError('Password is required', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        username,
        password,
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
    const { username } = req.body;

    if (!username) {
        return next(createHttpError('Username is required!', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        username,
    };

    next();
};

const validateResetPasswordBody = (req, res, next) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return next(createHttpError('Token and password are required!', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        token,
        password,
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
    validateResetPasswordBody,
};
