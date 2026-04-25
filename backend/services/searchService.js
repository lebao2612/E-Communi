const Post = require('../models/Post');
const User = require('../models/User');

const search = async ({ q, type, page = 1, limit = 15 }) => {
    const skip = (page - 1) * limit;
    const results = {};

    if (!type || type === 'users' || type === 'all') {
        const users = await User.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        )
            .select('_id username fullname avatar bio followers following')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit)
            .lean();

        results.users = users;
    }

    if (!type || type === 'posts' || type === 'all') {
        const posts = await Post.find(
            {
                $text: { $search: q },
                privacy: 'public',
            },
            { score: { $meta: 'textScore' } }
        )
            .populate('user', 'username fullname avatar')
            .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        results.posts = posts;
    }

    return {
        success: true,
        data: results,
        page,
        limit,
    };
};

module.exports = {
    search,
};
