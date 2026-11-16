const asyncHandler = require('../utils/asyncHandler');
const uploadService = require('../services/uploadService');

const uploadImage = asyncHandler(async (req, res) => {
    const result = await uploadService.uploadImage({
        file: req.file,
        userId: req.userId,
    });

    res.status(200).json(result);
});

const uploadMultipleImages = asyncHandler(async (req, res) => {
    const files = req.files;
    
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const results = await Promise.all(
        files.map(file => uploadService.uploadImage({ file, userId: req.userId }))
    );

    const imageUrls = results.map(result => result.imageUrl);

    res.status(200).json({
        message: 'Images uploaded successfully',
        imageUrls,
    });
});

module.exports = {
    uploadImage,
    uploadMultipleImages,
};
