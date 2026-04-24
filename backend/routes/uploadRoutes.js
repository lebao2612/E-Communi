const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload, uploadToCloudinary, hasValidImageSignature } = require('../middleware/uploadMiddleware');
const { moderateImageBuffer } = require('../services/contentModerationService');

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many upload requests, please try again later.' },
});

router.post('/upload', authMiddleware, uploadLimiter, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid image file content' });
        }

        const moderation = await moderateImageBuffer(req.file.buffer);
        if (moderation.enabled && moderation.blocked) {
            console.warn('[UPLOAD_MODERATION] BLOCKED', {
                userId: req.userId,
                threshold: moderation.threshold,
                scores: moderation.scores,
                mimetype: req.file.mimetype,
            });
            return res.status(403).json({
                message: 'Image rejected by content moderation policy',
                moderation: {
                    threshold: moderation.threshold,
                    scores: moderation.scores,
                },
            });
        }

        console.log('[UPLOAD_MODERATION] ALLOWED', {
            userId: req.userId,
            enabled: moderation.enabled,
            threshold: moderation.threshold,
            scores: moderation.scores,
            mimetype: req.file.mimetype,
        });

        const result = await uploadToCloudinary(req.file.buffer);

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        if (error.name === 'MulterError') {
            return res.status(400).json({ message: error.message });
        }

        if (error.message && error.message.includes('Only JPEG, PNG, WEBP, or GIF')) {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 'MODERATION_CONFIG_ERROR') {
            return res.status(503).json({ message: error.message });
        }

        if (error.code === 'MODERATION_AUTH_ERROR') {
            return res.status(403).json({ message: error.message });
        }

        if (error.code === 'MODERATION_RATE_LIMIT') {
            return res.status(429).json({ message: error.message });
        }

        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
