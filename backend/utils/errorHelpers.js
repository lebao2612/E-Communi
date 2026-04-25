const mongoose = require('mongoose');

const createHttpError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const ensureObjectId = (value, fieldName = 'id') => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw createHttpError(`${fieldName} is invalid`, 400);
    }
};

module.exports = {
    createHttpError,
    ensureObjectId,
};