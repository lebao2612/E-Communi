const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
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

module.exports = { upload, uploadToCloudinary };
