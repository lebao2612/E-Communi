const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

router.post('/post/:id', authMiddleware, commentController.addComment);
router.get('/post/:id', commentController.getCommentsByPost);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
