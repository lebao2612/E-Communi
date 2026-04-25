const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const { moderateImageBuffer } = require('./contentModerationService');
const { createHttpError } = require('../utils/errorHelpers');

const mapModerationErrorToHttpError = (error) => {
    if (error.code === 'MODERATION_CONFIG_ERROR') {
        return createHttpError(error.message, 503);
    }

    if (error.code === 'MODERATION_AUTH_ERROR') {
        return createHttpError(error.message, 403);
    }

    if (error.code === 'MODERATION_RATE_LIMIT') {
        return createHttpError(error.message, 429);
    }

    if (error.code === 'MODERATION_SERVICE_ERROR') {
        return createHttpError(error.message, 503);
    }

    return error;
};

const uploadImage = async ({ file, userId }) => {
    try {
        const moderation = await moderateImageBuffer(file.buffer);

        if (moderation.enabled && moderation.blocked) {
            const error = createHttpError('Image rejected by content moderation policy', 403);
            error.details = {
                moderation: {
                    threshold: moderation.threshold,
                    scores: moderation.scores,
                },
            };
            throw error;
        }

        const result = await uploadToCloudinary(file.buffer);

        return {
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        throw mapModerationErrorToHttpError(error);
    }
};

module.exports = {
    uploadImage,
};
