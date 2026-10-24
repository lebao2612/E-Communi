const express = require('express');
const rateLimit = require('express-rate-limit');
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
    validateForgotPasswordBody,
    validateVerifyOtpBody,
    validateResetPasswordBody,
} = require('../middleware/userValidation');

// Giới hạn chống spam gửi email OTP (tối đa 5 lần / 15 phút)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, validateUpdateUserBody, userController.updateUser);
router.put('/update', authMiddleware, validateUpdateUserBody, userController.updateUser);

// GET /api/users/
router.get('/', userController.getAllUsers);

// POST /api/users/login
router.post('/login', validateLoginBody, userController.login);

// POST /api/users/register
router.post('/register', validateRegisterBody, userController.register);

// POST /api/users/refresh-token
router.post('/refresh-token', validateRefreshTokenBody, userController.refreshToken);

// Luồng Quên mật khẩu & Đặt lại mật khẩu qua OTP
// POST /api/users/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPasswordBody, userController.forgotPassword);

// POST /api/users/verify-otp
router.post('/verify-otp', validateVerifyOtpBody, userController.verifyOtp);

// POST /api/users/reset-password
router.post('/reset-password', validateResetPasswordBody, userController.resetPassword);

// Follow system
router.post('/follow/:id', authMiddleware, validateUserIdParam, userController.followUser);
router.post('/unfollow/:id', authMiddleware, validateUserIdParam, userController.unfollowUser);
router.get('/followers/:id', validateUserIdParam, userController.getFollowers);
router.get('/following/:id', validateUserIdParam, userController.getFollowing);

// GET /api/users/:username
router.get('/:username', validateUsernameParam, userController.getUserByUsername);

module.exports = router;