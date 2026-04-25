const commentService = require('../services/commentService');
const asyncHandler = require('../utils/asyncHandler');

exports.addComment = asyncHandler(async (req, res) => {
    const result = await commentService.addComment({
        postId: req.validated.postId,
        userId: req.userId,
        content: req.validated.content,
    });

    res.status(201).json(result);
});

exports.getCommentsByPost = asyncHandler(async (req, res) => {
    const result = await commentService.getCommentsByPost(req.validated.postId);
    res.status(200).json(result);
});

exports.deleteComment = asyncHandler(async (req, res) => {
    const result = await commentService.deleteComment({
        commentId: req.validated.commentId,
        userId: req.userId,
    });

    res.status(200).json(result);
});
