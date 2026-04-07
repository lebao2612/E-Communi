const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getIceServers } = require('../controllers/webrtcController');

const router = express.Router();

router.get('/ice-servers', authMiddleware, getIceServers);

module.exports = router;
