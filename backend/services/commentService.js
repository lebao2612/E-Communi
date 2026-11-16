const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

const addComment = async ({ postId, userId, content, parentId = null }) => {
    ensureObjectId(postId, 'postId');
    ensureObjectId(userId, 'userId');
    if (parentId) ensureObjectId(parentId, 'parentId');

    const normalizedContent = typeof content === 'string' ? content.trim() : '';
    if (!normalizedContent) {
        throw createHttpError('Comment content is required', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw createHttpError('Post not found', 404);
    }

    let replyTo = null;
    if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
            throw createHttpError('Parent comment not found', 404);
        }
        if (parentComment.postId.toString() !== postId.toString()) {
            throw createHttpError('Parent comment does not belong to this post', 400);
        }
        replyTo = parentComment.user;
    }

    const newComment = new Comment({
        content: normalizedContent,
        user: userId,
        postId,
        parentId,
        replyTo,
    });

    await newComment.save();

    if (!parentId) {
        post.comments.push(newComment._id);
        await post.save();
    }

    await newComment.populate('user', 'username fullname avatar');
    if (replyTo) {
        await newComment.populate('replyTo', 'username fullname avatar');
    }

    if (post.user.toString() !== userId.toString()) {
        createNotification({
            recipientId: post.user,
            senderId: userId,
            type: 'comment',
            postId: post._id,
            commentId: newComment._id,
        }).catch((err) => console.error('Comment notification error:', err));
    }

    if (replyTo && replyTo.toString() !== post.user.toString() && replyTo.toString() !== userId.toString()) {
        createNotification({
            recipientId: replyTo,
            senderId: userId,
            type: 'reply_comment',
            postId: post._id,
            commentId: newComment._id,
        }).catch((err) => console.error('Reply notification error:', err));
    }

    return {
        message: 'Comment added successfully',
        data: newComment,
    };
};

const buildCommentTree = (comments) => {
    const commentMap = new Map();
    const roots = [];

    comments.forEach(comment => {
        commentMap.set(comment._id.toString(), {
            ...comment.toObject(),
            replies: []
        });
    });

    comments.forEach(comment => {
        const commentObj = commentMap.get(comment._id.toString());
        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId.toString());
            if (parent) {
                parent.replies.push(commentObj);
            } else {
                roots.push(commentObj);
            }
        } else {
            roots.push(commentObj);
        }
    });

    roots.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const sortReplies = (comments) => {
        comments.forEach(c => {
            c.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            sortReplies(c.replies);
        });
    };
    sortReplies(roots);

    return roots;
};

const getCommentsByPost = async (postId) => {
    ensureObjectId(postId, 'postId');

    const comments = await Comment.find({ postId })
        .sort({ createdAt: 1 })
        .populate('user', 'username fullname avatar')
        .populate('replyTo', 'username fullname avatar');

    const tree = buildCommentTree(comments);

    return {
        message: 'Comments fetched successfully',
        data: tree,
    };
};

const getCommentDescendants = async (commentId) => {
    const descendants = [];
    const children = await Comment.find({ parentId: commentId });
    
    for (const child of children) {
        descendants.push(child._id);
        const childDescendants = await getCommentDescendants(child._id);
        descendants.push(...childDescendants);
    }
    
    return descendants;
};

const deleteComment = async ({ commentId, userId }) => {
    ensureObjectId(commentId, 'commentId');
    ensureObjectId(userId, 'userId');

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw createHttpError('Comment not found', 404);
    }

    const post = await Post.findById(comment.postId);
    const isPostAuthor = post && post.user.toString() === userId.toString();
    const isCommentAuthor = comment.user.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
        throw createHttpError('Not authorized to delete this comment', 403);
    }

    const descendantIds = await getCommentDescendants(commentId);
    const allIdsToDelete = [commentId, ...descendantIds];

    await Comment.deleteMany({ _id: { $in: allIdsToDelete } });

    if (!comment.parentId) {
        await Post.findByIdAndUpdate(comment.postId, {
            $pull: { comments: commentId }
        });
    }

    return {
        message: 'Comment deleted successfully',
        deletedCount: allIdsToDelete.length,
    };
};

module.exports = {
    addComment,
    getCommentsByPost,
    deleteComment,
};
