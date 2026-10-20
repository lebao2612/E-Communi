const crypto = require('crypto');

const User = require('../models/User');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

const SAFE_USER_SELECT = '-password -refreshToken';

const getAllUsers = async () => User.find().select(SAFE_USER_SELECT);

const getUserByUsername = async (username) => {
    const user = await User.findOne({ username }).select(SAFE_USER_SELECT);
    if (!user) {
        throw createHttpError('User not found', 404);
    }
    return user;
};

const getMe = async (userId) => {
    ensureObjectId(userId, 'userId');

    const user = await User.findById(userId).select(SAFE_USER_SELECT);
    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user;
};

const updateUser = async ({ userId, updates }) => {
    ensureObjectId(userId, 'userId');

    const allowedUpdates = ['fullname', 'bio', 'avatar', 'coverImage'];
    const actualUpdates = {};

    Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            actualUpdates[key] = updates[key];
        }
    });

    const user = await User.findByIdAndUpdate(userId, actualUpdates, { new: true }).select(SAFE_USER_SELECT);
    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user;
};

const { createNotification } = require('./notificationService');

const followUser = async ({ currentUserId, targetUserId }) => {
    ensureObjectId(currentUserId, 'currentUserId');
    ensureObjectId(targetUserId, 'targetUserId');

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
        throw createHttpError('User not found', 404);
    }

    if (userToFollow.followers.some((id) => id.toString() === currentUserId)) {
        throw createHttpError('You are already following this user', 400);
    }

    await userToFollow.updateOne({ $push: { followers: currentUserId } });
    await currentUser.updateOne({ $push: { following: targetUserId } });

    createNotification({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: 'follow',
    }).catch((err) => console.error('Follow notification error:', err));

    return { message: 'User followed successfully' };
};

const unfollowUser = async ({ currentUserId, targetUserId }) => {
    ensureObjectId(currentUserId, 'currentUserId');
    ensureObjectId(targetUserId, 'targetUserId');

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
        throw createHttpError('User not found', 404);
    }

    if (!userToUnfollow.followers.some((id) => id.toString() === currentUserId)) {
        throw createHttpError('You are not following this user', 400);
    }

    await userToUnfollow.updateOne({ $pull: { followers: currentUserId } });
    await currentUser.updateOne({ $pull: { following: targetUserId } });

    return { message: 'User unfollowed successfully' };
};

const getFollowers = async (userId) => {
    ensureObjectId(userId, 'userId');

    const user = await User.findById(userId).populate('followers', 'username fullname avatar');
    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user.followers;
};

const getFollowing = async (userId) => {
    ensureObjectId(userId, 'userId');

    const user = await User.findById(userId).populate('following', 'username fullname avatar');
    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user.following;
};

const sendPasswordResetEmail = async () => {
    throw createHttpError('Email service is not configured', 503);
};

const forgotPassword = async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw createHttpError('User not found!', 400);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
        to: user.email,
        subject: 'Reset Password',
        text: `Click the link to reset your password: ${resetUrl}`,
    });

    return { message: 'Reset link sent to your email' };
};

const resetPassword = async ({ token, password }) => {
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw createHttpError('Invalid or expired token!', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
};

module.exports = {
    getAllUsers,
    getUserByUsername,
    getMe,
    updateUser,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    forgotPassword,
    resetPassword,
};
