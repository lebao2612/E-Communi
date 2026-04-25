const multer = require('multer');

const { upload, hasValidImageSignature } = require('./uploadMiddleware');
const { createHttpError } = require('../utils/errorHelpers');

const uploadSingleImage = (req, res, next) => {
    upload.single('image')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            return next(createHttpError(error.message, 400));
        }

        return next(createHttpError(error.message || 'Invalid upload payload', 400));
    });
};

const validateUploadedImage = (req, res, next) => {
    if (!req.file) {
        return next(createHttpError('No file uploaded', 400));
    }

    if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
        return next(createHttpError('Invalid image file content', 400));
    }

    next();
};

module.exports = {
    uploadSingleImage,
    validateUploadedImage,
};
