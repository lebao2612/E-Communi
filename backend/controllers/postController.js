const mongoose = require('mongoose');

const Post = require('../models/Post');

exports.getPostsByUserId = async (req, res) => {
    try {
        const user = req.query.user;

        const posts = await Post.find({user});
        if(!posts){
            return res.status(404).json({error: 'Post for user not found by userId'});
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
    try{
        const posts = await Post.find()
            .populate('user', 'username fullname');
            
        res.status(200).json({
            message: 'Get all posts successfully',
            data: posts,
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

exports.upPost = async(req, res) => {
    try{
        const {userId, content} = req.body;
        const newPost = new Post({user: userId, content: content});

        await newPost.save();
        res.status(201).json({message:'up Post successfully', post: newPost});
    } catch (err){
        res.status(500).json({error: err.message});
    }
}

