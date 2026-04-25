const mongoose = require('mongoose');

const Message = require('../models/Message');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

const sendMessage = async ({ user1, user2, content }) => {
    ensureObjectId(user1, 'user1');
    ensureObjectId(user2, 'user2');

    const normalizedContent = typeof content === 'string' ? content.trim() : '';
    if (!normalizedContent) {
        throw createHttpError('Missing required fields', 400);
    }

    const newMessage = await Message.create({
        user1,
        user2,
        content: normalizedContent,
    });

    return {
        message: 'Message sent successfully',
        data: newMessage,
    };
};

const getMessagesBetweenUsers = async ({ user1, user2, limit = 20, before }) => {
    ensureObjectId(user1, 'user1');
    ensureObjectId(user2, 'user2');

    const baseFilter = {
        $or: [
            { user1, user2 },
            { user1: user2, user2: user1 },
        ],
    };

    let cursorFilter = {};
    if (before) {
        ensureObjectId(before, 'before');
        cursorFilter = { _id: { $lt: new mongoose.Types.ObjectId(before) } };
    }

    const query = { ...baseFilter, ...cursorFilter };

    const fetchedMessages = await Message.find(query)
        .sort({ _id: -1 })
        .limit(limit);

    const messages = fetchedMessages.reverse();
    const oldestMessage = messages[0] || null;
    const hasMore = fetchedMessages.length === limit;

    return {
        message: 'Messages fetched successfully',
        data: messages,
        pagination: {
            limit,
            hasMore,
            nextCursor: oldestMessage ? oldestMessage._id : null,
        },
    };
};

const getUnreadSummary = async (currentUserId) => {
    ensureObjectId(currentUserId, 'currentUserId');

    const summary = await Message.aggregate([
        {
            $match: {
                user2: new mongoose.Types.ObjectId(currentUserId),
                isRead: { $ne: true },
            },
        },
        {
            $group: {
                _id: '$user1',
                count: { $sum: 1 },
            },
        },
    ]);

    const unreadCountByFriendId = summary.reduce((acc, row) => {
        acc[String(row._id)] = row.count;
        return acc;
    }, {});

    return {
        message: 'Unread summary fetched successfully',
        data: unreadCountByFriendId,
    };
};

const markConversationAsRead = async ({ friendId, currentUserId }) => {
    ensureObjectId(friendId, 'friendId');
    ensureObjectId(currentUserId, 'currentUserId');

    const result = await Message.updateMany(
        {
            user1: new mongoose.Types.ObjectId(friendId),
            user2: new mongoose.Types.ObjectId(currentUserId),
            isRead: { $ne: true },
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }
    );

    return {
        message: 'Conversation marked as read',
        data: {
            modifiedCount: result.modifiedCount,
        },
    };
};

module.exports = {
    sendMessage,
    getMessagesBetweenUsers,
    getUnreadSummary,
    markConversationAsRead,
};
