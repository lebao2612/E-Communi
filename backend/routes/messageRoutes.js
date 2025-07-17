const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');



// POST /api/users/register
router.post('/send', messageController.sendMessage);

// GET /api/users/
router.get('/:user1/:user2', messageController.getMessagesBetweenUsers);

module.exports = router;