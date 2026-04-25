const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');
const {
    validateSendMessageBody,
    validateGetMessagesByFriendParams,
    validateMarkConversationAsReadParams,
} = require('../middleware/messageValidation');



// POST /api/messages/send
router.post('/send', authMiddleware, validateSendMessageBody, messageController.sendMessage);

// GET /api/messages/unread/summary
router.get('/unread/summary', authMiddleware, messageController.getUnreadSummary);

// PATCH /api/messages/read/:friendId
router.patch('/read/:friendId', authMiddleware, validateMarkConversationAsReadParams, messageController.markConversationAsRead);

// GET /api/messages/:friendId
router.get('/:friendId', authMiddleware, validateGetMessagesByFriendParams, messageController.getMessagesBetweenUsers);

module.exports = router;