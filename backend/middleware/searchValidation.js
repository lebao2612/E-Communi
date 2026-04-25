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

const validateSearchQuery = (req, res, next) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const type = req.query.type;
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 15);

    if (!q) {
        return next(createHttpError('Search query is required', 400));
    }

    if (type !== undefined && !['users', 'posts', 'all'].includes(type)) {
        return next(createHttpError('type must be users, posts, or all', 400));
    }

    if (page === null) {
        return next(createHttpError('page must be a positive integer', 400));
    }

    if (limit === null || limit > 50) {
        return next(createHttpError('limit must be a positive integer and <= 50', 400));
    }

    req.validated = {
        ...(req.validated || {}),
        q,
        type,
        page,
        limit,
    };

    next();
};

module.exports = {
    validateSearchQuery,
};
