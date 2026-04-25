const searchService = require('../services/searchService');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/search
// @desc    Search for users and/or posts
// @access  Public (or Private depending on your auth middleware setup, currently assuming Public for base search)
exports.search = asyncHandler(async (req, res) => {
    const result = await searchService.search({
        q: req.validated.q,
        type: req.validated.type,
        page: req.validated.page,
        limit: req.validated.limit,
    });

    return res.status(200).json(result);
});
