const mongoose = require('mongoose');
const { createHttpError } = require('../utils/errorHelpers');

const parseLimit = (value, fallback = 20) => {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return null;
    }

    return Math.min(parsed, 50);
};

const validateSendMessageBody = (req, res, next) => {
    const { user2, content } = req.body;

    if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
        return next(createHttpError('Invalid user IDs', 400));
    }

    if (!user2 || !mongoose.Types.ObjectId.isValid(user2)) {
        return next(createHttpError('Invalid user IDs', 400));
    }

    if (typeof content !== 'string' || !content.trim()) {
        return next(createHttpError('Missing required fields', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        user1: req.userId,
        user2,
        content,
    };

    next();
};

const validateGetMessagesByFriendParams = (req, res, next) => {
    const { friendId } = req.params;
    const limit = parseLimit(req.query.limit, 20);
    const { before } = req.query;
    const currentUserId = req.userId;

    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
        return next(createHttpError('Unauthorized', 401));
    }

    if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
        return next(createHttpError('Invalid friend ID', 400));
    }

    if (friendId === currentUserId) {
        return next(createHttpError('friendId must be different from current user', 400));
    }

    if (limit === null) {
        return next(createHttpError('Invalid limit', 400));
    }

    if (before && !mongoose.Types.ObjectId.isValid(before)) {
        return next(createHttpError('Invalid cursor', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        user1: currentUserId,
        user2: friendId,
        limit,
        before,
    };

    next();
};

const validateMarkConversationAsReadParams = (req, res, next) => {
    const friendId = req.params.friendId;

    if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
        return next(createHttpError('Invalid friend ID', 400));
    }

    if (!req.userId || !mongoose.Types.ObjectId.isValid(req.userId)) {
        return next(createHttpError('Invalid current user ID', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        friendId,
        currentUserId: req.userId,
    };

    next();
};

module.exports = {
    validateSendMessageBody,
    validateGetMessagesByFriendParams,
    validateMarkConversationAsReadParams,
};
