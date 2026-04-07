const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');



// POST /api/messages/send
router.post('/send', authMiddleware, messageController.sendMessage);

// GET /api/messages/:user1/:user2
router.get('/:user1/:user2', authMiddleware, messageController.getMessagesBetweenUsers);

module.exports = router;