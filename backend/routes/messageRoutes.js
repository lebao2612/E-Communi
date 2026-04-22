const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');



// POST /api/messages/send
router.post('/send', authMiddleware, messageController.sendMessage);

// GET /api/messages/unread/summary
router.get('/unread/summary', authMiddleware, messageController.getUnreadSummary);

// PATCH /api/messages/read/:friendId
router.patch('/read/:friendId', authMiddleware, messageController.markConversationAsRead);

// GET /api/messages/:user1/:user2
router.get('/:user1/:user2', authMiddleware, messageController.getMessagesBetweenUsers);

module.exports = router;