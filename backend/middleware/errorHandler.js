const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.httpStatus || 500;
    const message = err.message || 'Internal server error';

    const payload = {
        error: message,
        message,
    };

    if (err.details && typeof err.details === 'object') {
        Object.assign(payload, err.details);
    }

    return res.status(statusCode).json(payload);
};

module.exports = errorHandler;