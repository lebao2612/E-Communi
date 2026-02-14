const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');



router.get('/me', authMiddleware, userController.getMe);
router.put('/update', authMiddleware, userController.updateUser);


// GET /api/users/
router.get('/', userController.getAllUsers);

//POST /api/users/login
router.post('/login', userController.login);

//POST /api/users/register
router.post('/register', userController.register);

router.post('/refresh-token', userController.refreshToken);


//GET /api/users/:username
router.get('/:username', userController.getUserByUsername);



module.exports = router;