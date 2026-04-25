const mongoose = require('mongoose');
const { createHttpError } = require('../utils/errorHelpers');

const parsePositiveInt = (value, fallback) => {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        return null;
    }

    return parsed;
};

const validateGetNewsFeedQuery = (req, res, next) => {
    const page = parsePositiveInt(req.query.page, 1);
    if (page === null) {
        return next(createHttpError('page must be a positive integer', 400));
    }

    const limit = parsePositiveInt(req.query.limit, 10);
    if (limit === null || limit > 50) {
        return next(createHttpError('limit must be a positive integer and <= 50', 400));
    }

    const userId = req.query.userId || req.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(createHttpError('Invalid userId', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        page,
        limit,
        userId,
    };

    next();
};

const validateGetPostsByUserQuery = (req, res, next) => {
    const { user } = req.query;

    if (!user || !mongoose.Types.ObjectId.isValid(user)) {
        return next(createHttpError('Invalid userId', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        userId: user,
    };

    next();
};

const validateCreatePostBody = (req, res, next) => {
    const { content, images, privacy } = req.body;

    if (content !== undefined && typeof content !== 'string') {
        return next(createHttpError('content must be a string', 400));
    }

    if (images !== undefined && !Array.isArray(images)) {
        return next(createHttpError('images must be an array', 400));
    }

    if (privacy !== undefined && !['public', 'followers'].includes(privacy)) {
        return next(createHttpError('privacy must be public or followers', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        content,
        images,
        privacy,
    };

    next();
};

const validatePostIdParam = (req, res, next) => {
    const postId = req.params.id;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return next(createHttpError('Invalid postId', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        postId,
    };

    next();
};

module.exports = {
    validateGetNewsFeedQuery,
    validateGetPostsByUserQuery,
    validateCreatePostBody,
    validatePostIdParam,
};
