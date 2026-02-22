const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            content,
            user: userId,
            postId
        });

        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();

        await newComment.populate('user', 'username fullname avatar');

        res.status(201).json({ message: 'Comment added successfully', data: newComment });
    } catch (err) {
        console.error('Error in addComment:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ postId })
            .sort({ createdAt: 1 }) // Older comments first
            .populate('user', 'username fullname avatar');

        res.status(200).json({ message: 'Comments fetched successfully', data: comments });
    } catch (err) {
        console.error('Error in getCommentsByPost:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);

        await Post.findByIdAndUpdate(comment.postId, {
            $pull: { comments: commentId }
        });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error in deleteComment:', err);
        res.status(500).json({ error: err.message });
    }
};
