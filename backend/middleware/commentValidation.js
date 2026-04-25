const mongoose = require('mongoose');
const { createHttpError } = require('../utils/errorHelpers');

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

const validateCommentBody = (req, res, next) => {
    const { content } = req.body;

    if (typeof content !== 'string' || !content.trim()) {
        return next(createHttpError('Comment content is required', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        content,
    };

    next();
};

const validateCommentIdParam = (req, res, next) => {
    const commentId = req.params.id;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        return next(createHttpError('Invalid commentId', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        commentId,
    };

    next();
};

module.exports = {
    validatePostIdParam,
    validateCommentBody,
    validateCommentIdParam,
};
