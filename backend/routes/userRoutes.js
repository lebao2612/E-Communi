const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');



// POST /api/users/register
router.post('/register', userController.registerUser);

// GET /api/users/
router.get('/', userController.getAllUsers);

module.exports = router;