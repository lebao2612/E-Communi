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

const uploadMultipleImages = (req, res, next) => {
    // Max 10 images per request
    upload.array('images', 10)(req, res, (error) => {
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

const validateUploadedImages = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(createHttpError('No files uploaded', 400));
    }

    for (const file of req.files) {
        if (!hasValidImageSignature(file.buffer, file.mimetype)) {
            return next(createHttpError('Invalid image file content', 400));
        }
    }

    next();
};

module.exports = {
    uploadSingleImage,
    uploadMultipleImages,
    validateUploadedImage,
    validateUploadedImages,
};
