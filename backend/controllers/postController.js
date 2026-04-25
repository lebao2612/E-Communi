const postService = require('../services/postService');
const asyncHandler = require('../utils/asyncHandler');

exports.getPostsByUserId = asyncHandler(async (req, res) => {
    const result = await postService.getPostsByUserId(req.validated.userId);
    res.status(200).json(result);
});

exports.getAllPosts = asyncHandler(async (req, res) => {
    const result = await postService.getAllPosts();
    res.status(200).json(result);
});

exports.upPost = asyncHandler(async (req, res) => {
    const result = await postService.createPost({
        userId: req.userId,
        content: req.validated.content,
        images: req.validated.images,
        privacy: req.validated.privacy,
    });

    res.status(201).json(result);
});

exports.getNewsFeed = asyncHandler(async (req, res) => {
    const result = await postService.getNewsFeedForUser({
        userId: req.validated.userId,
        page: req.validated.page,
        limit: req.validated.limit,
    });
    res.status(200).json(result);
});

exports.toggleLike = asyncHandler(async (req, res) => {
    const result = await postService.toggleLike({
        postId: req.validated.postId,
        userId: req.userId,
    });

    res.status(200).json(result);
});
