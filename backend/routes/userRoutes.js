const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
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

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, validateUpdateUserBody, userController.updateUser);
router.put('/update', authMiddleware, validateUpdateUserBody, userController.updateUser);

// GET /api/users/
router.get('/', userController.getAllUsers);

// POST /api/users/login (Áp dụng authLimiter chống brute-force)
router.post('/login', authLimiter, validateLoginBody, userController.login);

// POST /api/users/register (Áp dụng authLimiter chống spam đăng ký tài khoản)
router.post('/register', authLimiter, validateRegisterBody, userController.register);

// POST /api/users/refresh-token
router.post('/refresh-token', validateRefreshTokenBody, userController.refreshToken);

// POST /api/users/logout
router.post('/logout', userController.logout);

// Luồng Quên mật khẩu & Đặt lại mật khẩu qua OTP
// POST /api/users/forgot-password
router.post('/forgot-password', otpLimiter, validateForgotPasswordBody, userController.forgotPassword);

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

// Google OAuth 2.0 routes
// POST /api/users/google-login
router.post('/google-login', authLimiter, userController.googleLogin);

// POST /api/users/google-complete
router.post('/google-complete', authLimiter, userController.googleCompleteRegistration);

// Xác thực email kích hoạt tài khoản OTP (Task 1.4)
// POST /api/users/verify-email
router.post('/verify-email', otpLimiter, userController.verifyEmail);

// POST /api/users/resend-verification-otp
router.post('/resend-verification-otp', otpLimiter, userController.resendVerificationOtp);

module.exports = router;