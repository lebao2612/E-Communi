const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

const addComment = async ({ postId, userId, content }) => {
    ensureObjectId(postId, 'postId');
    ensureObjectId(userId, 'userId');

    const normalizedContent = typeof content === 'string' ? content.trim() : '';
    if (!normalizedContent) {
        throw createHttpError('Comment content is required', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw createHttpError('Post not found', 404);
    }

    const newComment = new Comment({
        content: normalizedContent,
        user: userId,
        postId,
    });

    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    await newComment.populate('user', 'username fullname avatar');

    return {
        message: 'Comment added successfully',
        data: newComment,
    };
};

const getCommentsByPost = async (postId) => {
    ensureObjectId(postId, 'postId');

    const comments = await Comment.find({ postId })
        .sort({ createdAt: 1 })
        .populate('user', 'username fullname avatar');

    return {
        message: 'Comments fetched successfully',
        data: comments,
    };
};

const deleteComment = async ({ commentId, userId }) => {
    ensureObjectId(commentId, 'commentId');
    ensureObjectId(userId, 'userId');

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw createHttpError('Comment not found', 404);
    }

    if (comment.user.toString() !== userId.toString()) {
        throw createHttpError('Not authorized to delete this comment', 403);
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(comment.postId, {
        $pull: { comments: commentId }
    });

    return {
        message: 'Comment deleted successfully',
    };
};

module.exports = {
    addComment,
    getCommentsByPost,
    deleteComment,
};
