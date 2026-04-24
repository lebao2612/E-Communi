const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

const allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const hasValidImageSignature = (buffer, mimetype) => {
    if (!buffer || buffer.length < 4) {
        return false;
    }

    if (mimetype === 'image/jpeg') {
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }

    if (mimetype === 'image/png') {
        return (
            buffer.length >= 8 &&
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0D &&
            buffer[5] === 0x0A &&
            buffer[6] === 0x1A &&
            buffer[7] === 0x0A
        );
    }

    if (mimetype === 'image/gif') {
        return (
            buffer[0] === 0x47 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x38
        );
    }

    if (mimetype === 'image/webp') {
        return (
            buffer.length >= 12 &&
            buffer[0] === 0x52 && // R
            buffer[1] === 0x49 && // I
            buffer[2] === 0x46 && // F
            buffer[3] === 0x46 && // F
            buffer[8] === 0x57 && // W
            buffer[9] === 0x45 && // E
            buffer[10] === 0x42 && // B
            buffer[11] === 0x50 // P
        );
    }

    return false;
};

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        if (!allowedImageMimeTypes.has(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
        }
        cb(null, true);
    },
});

const uploadToCloudinary = (fileBuffer, folder = 'e-community') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

module.exports = {
    upload,
    uploadToCloudinary,
    hasValidImageSignature,
};
