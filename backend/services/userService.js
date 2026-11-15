const User = require('../models/User');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');
const { createNotification } = require('./notificationService');

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

/**
 * Follow một người dùng với cơ chế Atomic Update và chống Race Condition
 */
const followUser = async ({ currentUserId, targetUserId }) => {
    ensureObjectId(currentUserId, 'currentUserId');
    ensureObjectId(targetUserId, 'targetUserId');

    // 1. Chặn người dùng tự follow chính mình
    if (currentUserId.toString() === targetUserId.toString()) {
        throw createHttpError('Bạn không thể tự theo dõi chính mình', 400);
    }

    // 2. Kiểm tra tài khoản hiện tại có tồn tại không
    const currentUserExists = await User.exists({ _id: currentUserId });
    if (!currentUserExists) {
        throw createHttpError('Tài khoản của bạn không tồn tại', 404);
    }

    // 3. Cập nhật Atomic: Dùng $addToSet đảm bảo không bao giờ bị trùng lặp ID
    // Điều kiện followers: { $ne: currentUserId } ngăn chặn ghi đè nếu đã theo dõi
    const updateTarget = await User.updateOne(
        { _id: targetUserId, followers: { $ne: currentUserId } },
        { $addToSet: { followers: currentUserId } }
    );

    // Nếu không khớp document nào (matchedCount === 0), phân loại lỗi cụ thể
    if (updateTarget.matchedCount === 0) {
        const targetExists = await User.exists({ _id: targetUserId });
        if (!targetExists) {
            throw createHttpError('Người dùng không tồn tại', 404);
        }
        throw createHttpError('Bạn đã theo dõi người dùng này rồi', 400);
    }

    // 4. Cập nhật atomic danh sách following của currentUser
    await User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: targetUserId } }
    );

    // 5. Gửi thông báo realtime (bất đồng bộ ngầm, không chặn phản hồi của client)
    createNotification({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: 'follow',
    }).catch((err) => console.error('Follow notification error:', err));

    return { message: 'Theo dõi người dùng thành công' };
};

/**
 * Hủy theo dõi một người dùng với cơ chế Atomic Update
 */
const unfollowUser = async ({ currentUserId, targetUserId }) => {
    ensureObjectId(currentUserId, 'currentUserId');
    ensureObjectId(targetUserId, 'targetUserId');

    // 1. Chặn người dùng tự hủy follow chính mình
    if (currentUserId.toString() === targetUserId.toString()) {
        throw createHttpError('Bạn không thể tự hủy theo dõi chính mình', 400);
    }

    // 2. Cập nhật Atomic: Chỉ xóa nếu targetUser đang có currentUserId trong followers
    const updateTarget = await User.updateOne(
        { _id: targetUserId, followers: currentUserId },
        { $pull: { followers: currentUserId } }
    );

    if (updateTarget.matchedCount === 0) {
        const targetExists = await User.exists({ _id: targetUserId });
        if (!targetExists) {
            throw createHttpError('Người dùng không tồn tại', 404);
        }
        throw createHttpError('Bạn chưa theo dõi người dùng này', 400);
    }

    // 3. Cập nhật atomic danh sách following của currentUser
    await User.updateOne(
        { _id: currentUserId },
        { $pull: { following: targetUserId } }
    );

    return { message: 'Hủy theo dõi người dùng thành công' };
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

module.exports = {
    getAllUsers,
    getUserByUsername,
    getMe,
    updateUser,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
};
