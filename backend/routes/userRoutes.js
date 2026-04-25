const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const {
    validateUsernameParam,
    validateRegisterBody,
    validateLoginBody,
    validateRefreshTokenBody,
    validateUpdateUserBody,
    validateUserIdParam,
} = require('../middleware/userValidation');



router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, validateUpdateUserBody, userController.updateUser);
router.put('/update', authMiddleware, validateUpdateUserBody, userController.updateUser);


// GET /api/users/
router.get('/', userController.getAllUsers);
router.get('/getAllUsers', userController.getAllUsers);

//POST /api/users/login
router.post('/login', validateLoginBody, userController.login);

//POST /api/users/register
router.post('/register', validateRegisterBody, userController.register);

//POST /api/users/refresh-token
router.post('/refresh-token', validateRefreshTokenBody, userController.refreshToken);



//Follow system
router.post('/follow/:id', authMiddleware, validateUserIdParam, userController.followUser);
router.post('/unfollow/:id', authMiddleware, validateUserIdParam, userController.unfollowUser);
router.get('/followers/:id', validateUserIdParam, userController.getFollowers);
router.get('/following/:id', validateUserIdParam, userController.getFollowing);


//GET /api/users/:username
router.get('/:username', validateUsernameParam, userController.getUserByUsername);



module.exports = router;