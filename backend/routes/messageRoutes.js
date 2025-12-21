const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');



// POST /api/messages/send
router.post('/send', messageController.sendMessage);

// GET /api/messages/:user1/:user2
router.get('/:user1/:user2', messageController.getMessagesBetweenUsers);

module.exports = router;