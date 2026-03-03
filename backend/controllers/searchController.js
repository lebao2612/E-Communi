const User = require('../models/User');
const Post = require('../models/Post');

// @route   GET /api/search
// @desc    Search for users and/or posts
// @access  Public (or Private depending on your auth middleware setup, currently assuming Public for base search)
exports.search = async (req, res) => {
    try {
        const { q, type, page = 1, limit = 15 } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        let results = {};

        // Search Users
        if (!type || type === 'users' || type === 'all') {
            const users = await User.find(
                { $text: { $search: q } },
                { score: { $meta: "textScore" } }
            )
                .select('_id username fullname avatar bio followers following')
                .sort({ score: { $meta: "textScore" } })
                .skip(skip)
                .limit(limitNum)
                .lean();

            results.users = users;
        }

        // Search Posts
        if (!type || type === 'posts' || type === 'all') {
            const posts = await Post.find(
                {
                    $text: { $search: q },
                    privacy: 'public' // Only search public posts
                },
                { score: { $meta: "textScore" } }
            )
                .populate('user', 'username fullname avatar')
                .sort({ score: { $meta: "textScore" }, createdAt: -1 }) // Sort by relevance, then newest
                .skip(skip)
                .limit(limitNum)
                .lean();

            results.posts = posts;
        }

        return res.status(200).json({
            success: true,
            data: results,
            page: parseInt(page),
            limit: limitNum
        });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, message: 'Server error during search' });
    }
};
