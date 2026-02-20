const mongoose = require('mongoose');

const Post = require('../models/Post');

exports.getPostsByUserId = async (req, res) => {
    try {
        const user = req.query.user;

        const posts = await Post.find({ user });
        if (!posts) {
            return res.status(404).json({ error: 'Post for user not found by userId' });
        }

        res.status(200).json({
            message: 'Posts fetched by UserId successfully',
            data: posts,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username fullname avatar');

        res.status(200).json({
            message: 'Get all posts successfully',
            data: posts,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.upPost = async (req, res) => {
    console.log("req.userId UP POST = ", req.userId);
    console.log("req.body = ", req.body);

    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { content, images, privacy } = req.body;

        if ((!content || !content.trim()) && (!images || images.length === 0)) {
            return res.status(400).json({ message: "Content or images are required" });
        }

        const newPost = new Post({
            user: req.userId,
            content: content ? content.trim() : "",
            images: images || [],
            privacy: privacy || 'public'
        });
        await newPost.save();

        // Populate user data before returning
        await newPost.populate('user', 'username fullname avatar');

        res.status(201).json({ message: 'up Post successfully', post: newPost });
    } catch (err) {
        console.error('Error in upPost:', err);
        res.status(500).json({ error: err.message });
    }
}

exports.getNewsFeed = async (req, res) => {
    try {
        const userId = req.query.userId || req.userId; // Prefer userId from token/query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find current user to get their following list
        const currentUser = await mongoose.model('User').findById(userId);
        if (!currentUser) {
            // If no user (e.g. public view), just return public posts? 
            // Requirement says: posts from followed user + public post of non-followed.
            // If unauthenticated, maybe just public posts. but let's assume authenticated for now or handle gracefully.
            // For now return public posts if no user found
            const publicPosts = await Post.find({ privacy: 'public' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username fullname avatar');
            return res.status(200).json({
                message: 'Get public posts successfully',
                data: publicPosts,
                page,
                totalPages: Math.ceil((await Post.countDocuments({ privacy: 'public' })) / limit)
            });
        }

        const followingIds = currentUser.following;

        // Logic:
        // 1. Posts from users I follow (regardless of privacy? usually yes, or maybe just their public/followers posts. 
        //    Let's assume if I follow them, I see all their posts unless there's a "private" setting not yet defined.
        //    Actually, privacy is 'public' or 'followers'. Since I follow them, I see 'followers' posts too.)
        // 2. Posts from myself.
        // 3. Posts from users I do NOT follow, BUT are 'public'.

        const query = {
            $or: [
                { user: { $in: followingIds } }, // Posts from people I follow
                { user: userId }, // My own posts
                { privacy: 'public', user: { $nin: followingIds } } // Public posts from people I DON'T follow
            ]
        };

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username fullname avatar');

        const totalPosts = await Post.countDocuments(query);

        res.status(200).json({
            message: 'Get news feed successfully',
            data: posts,
            page,
            totalPages: Math.ceil(totalPosts / limit)
        });

    } catch (err) {
        console.error("Error in getNewsFeed:", err);
        res.status(500).json({ error: err.message });
    }
}

