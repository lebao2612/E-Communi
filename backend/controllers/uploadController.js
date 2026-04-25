const asyncHandler = require('../utils/asyncHandler');
const uploadService = require('../services/uploadService');

const uploadImage = asyncHandler(async (req, res) => {
    const result = await uploadService.uploadImage({
        file: req.file,
        userId: req.userId,
    });

    res.status(200).json(result);
});

module.exports = {
    uploadImage,
};
