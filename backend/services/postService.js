const mongoose = require('mongoose');

const Post = require('../models/Post');
const User = require('../models/User');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const getPostsByUserId = async (userId) => {
    ensureObjectId(userId, 'userId');

    const posts = await Post.find({ user: userId })
        .sort({ createdAt: 1 })
        .populate('user', 'username fullname avatar');

    return {
        message: 'Posts fetched by UserId successfully',
        data: posts,
    };
};

const getAllPosts = async () => {
    const posts = await Post.find()
        .populate('user', 'username fullname avatar');

    return {
        message: 'Get all posts successfully',
        data: posts,
    };
};

const getNewsFeedForUser = async ({ userId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }) => {
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        const query = { privacy: 'public' };
        const [publicPosts, totalPublicPosts] = await Promise.all([
            Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username fullname avatar'),
            Post.countDocuments(query),
        ]);

        return {
            message: 'Get public posts successfully',
            data: publicPosts,
            page,
            totalPages: Math.ceil(totalPublicPosts / limit),
        };
    }

    const followingIds = currentUser.following || [];

    const query = {
        $or: [
            { user: { $in: followingIds } },
            { user: new mongoose.Types.ObjectId(userId) },
            { privacy: 'public', user: { $nin: followingIds } },
        ]
    };

    const [posts, totalPosts] = await Promise.all([
        Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username fullname avatar'),
        Post.countDocuments(query),
    ]);

    return {
        message: 'Get news feed successfully',
        data: posts,
        page,
        totalPages: Math.ceil(totalPosts / limit),
    };
};

const createPost = async ({ userId, content, images = [], privacy = 'public' }) => {
    ensureObjectId(userId, 'userId');

    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw createHttpError('User not found', 404);
    }

    const normalizedContent = typeof content === 'string' ? content.trim() : '';
    const normalizedImages = Array.isArray(images) ? images : [];

    if (!normalizedContent && normalizedImages.length === 0) {
        throw createHttpError('Content or images are required', 400);
    }

    const newPost = new Post({
        user: userId,
        content: normalizedContent,
        images: normalizedImages,
        privacy,
    });

    await newPost.save();
    await newPost.populate('user', 'username fullname avatar');

    return {
        message: 'Post created successfully',
        post: newPost,
    };
};

const { createNotification } = require('./notificationService');

const toggleLike = async ({ postId, userId }) => {
    ensureObjectId(postId, 'postId');
    ensureObjectId(userId, 'userId');

    const post = await Post.findById(postId);
    if (!post) {
        throw createHttpError('Post not found', 404);
    }

    const isLiked = post.likes.some((likedUserId) => likedUserId.toString() === userId.toString());
    if (isLiked) {
        post.likes.pull(userId);
    } else {
        post.likes.push(userId);
    }

    await post.save();

    if (!isLiked) {
        createNotification({
            recipientId: post.user,
            senderId: userId,
            type: 'like',
            postId: post._id,
        }).catch((err) => console.error('Like notification error:', err));
    }

    return {
        message: isLiked ? 'Unliked successfully' : 'Liked successfully',
        likes: post.likes,
    };
};

const getSinglePostById = async (postId) => {
    ensureObjectId(postId, 'postId');

    const post = await Post.findById(postId)
        .populate('user', 'username fullname avatar')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'username fullname avatar' },
        });

    if (!post) {
        throw createHttpError('Post not found', 404);
    }

    return {
        message: 'Post fetched successfully',
        post,
    };
};

module.exports = {
    getPostsByUserId,
    getAllPosts,
    createPost,
    getNewsFeedForUser,
    toggleLike,
    getSinglePostById,
};
