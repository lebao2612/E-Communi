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
            .populate('user', 'username fullname');

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

        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newPost = new Post({ user: req.userId, content: content.trim() });
        await newPost.save();

        // Populate user data before returning
        await newPost.populate('user', 'username fullname');

        res.status(201).json({ message: 'up Post successfully', post: newPost });
    } catch (err) {
        console.error('Error in upPost:', err);
        res.status(500).json({ error: err.message });
    }
}

