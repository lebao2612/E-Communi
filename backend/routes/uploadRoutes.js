const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');
const { uploadSingleImage, validateUploadedImage } = require('../middleware/uploadValidation');

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many upload requests, please try again later.' },
});

router.post('/upload', authMiddleware, uploadLimiter, uploadSingleImage, validateUploadedImage, uploadController.uploadImage);

module.exports = router;
