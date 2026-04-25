const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');
const {
	validatePostIdParam,
	validateCommentBody,
	validateCommentIdParam,
} = require('../middleware/commentValidation');

router.post('/post/:id', authMiddleware, validatePostIdParam, validateCommentBody, commentController.addComment);
router.get('/post/:id', validatePostIdParam, commentController.getCommentsByPost);
router.delete('/:id', authMiddleware, validateCommentIdParam, commentController.deleteComment);

module.exports = router;
