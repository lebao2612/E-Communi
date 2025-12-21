const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');



// POST /api/users/register
router.post('/register', userController.registerUser);

//GET /api/users/:username
router.get('/:username', userController.getUserByUsername);

// GET /api/users/
router.get('/', userController.getAllUsers);

//POST /api/users/login
router.post('/login', userController.login);

//POST /api/users/register
router.post('/register', userController.register);

module.exports = router;