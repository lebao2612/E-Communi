const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { createHttpError } = require('../utils/errorHelpers');

const SAFE_USER_SELECT = '-password -refreshToken';

const register = async ({ username, fullname, password, confirmPassword, avatar }) => {
    if (password !== confirmPassword) {
        throw createHttpError('Passwords do not match', 400);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw createHttpError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        fullname,
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

module.exports = {
    register,
    login,
    refreshToken,
};
