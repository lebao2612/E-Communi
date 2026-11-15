const userService = require('../services/userService');
const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { getRefreshTokenCookieOptions } = require('../utils/cookieOptions');


// [GET] /api/users/
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

// [GET] /api/users/:username
exports.getUserByUsername = asyncHandler(async (req, res) => {
  const user = await userService.getUserByUsername(req.validated.username);
  res.json(user);
});


// [POST] /api/users/register
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register({
    username: req.validated.username,
    fullname: req.validated.fullname,
    email: req.validated.email,
    password: req.validated.password,
    confirmPassword: req.validated.confirmPassword,
    avatar: req.validated.avatar,
  });

  res.status(201).json(result);
});

//[POST] /api/users/login
exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    identifier: req.validated.identifier || req.validated.username,
    username: req.validated.username,
    password: req.validated.password,
  });

  // Lưu refresh token vào httpOnly Cookie an toàn
  res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  res.json(result);
});

// [POST] /api/users/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.validated.refreshToken);

  // Ghi đè cookie refreshToken mới vào trình duyệt (Refresh Token Rotation)
  res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

// [POST] /api/users/logout
exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await authService.logout(token);

  // Xóa cookie refreshToken
  res.clearCookie('refreshToken', {
    ...getRefreshTokenCookieOptions(),
    maxAge: 0,
  });

  res.json(result);
});

// [GET] /api/users/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.userId);
  res.json(user);
});

// [PUT] /api/users/update
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser({ userId: req.userId, updates: req.validated.updates });
  res.json(user);
});



// [POST] /api/users/follow/:id
exports.followUser = asyncHandler(async (req, res) => {
  const result = await userService.followUser({
    currentUserId: req.userId,
    targetUserId: req.validated.userId,
  });

  res.status(200).json(result);
});

// [POST] /api/users/unfollow/:id
exports.unfollowUser = asyncHandler(async (req, res) => {
  const result = await userService.unfollowUser({
    currentUserId: req.userId,
    targetUserId: req.validated.userId,
  });

  res.status(200).json(result);
});

// [GET] /api/users/followers/:id
exports.getFollowers = asyncHandler(async (req, res) => {
  const followers = await userService.getFollowers(req.validated.userId);
  res.json(followers);
});

// [GET] /api/users/following/:id
exports.getFollowing = asyncHandler(async (req, res) => {
  const following = await userService.getFollowing(req.validated.userId);
  res.json(following);
});

// [POST] /api/users/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.validated.identifier);
  res.json(result);
});

// [POST] /api/users/verify-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp({
    email: req.validated.email,
    otp: req.validated.otp,
  });
  res.json(result);
});

// [POST] /api/users/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    email: req.validated.email,
    resetToken: req.validated.resetToken,
    newPassword: req.validated.newPassword,
    confirmPassword: req.validated.confirmPassword,
  });

  res.json(result);
});

// [POST] /api/users/google-login
exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const result = await authService.googleLogin(idToken);

  // Nếu là TH1 (đã có tài khoản), set cookie refreshToken và trả về accessToken
  if (!result.isNewUser && result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());
    return res.json({
      isNewUser: false,
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  // Nếu là TH2 (chưa có tài khoản), trả về thông tin để hoàn tất profile
  res.json({
    isNewUser: true,
    message: result.message,
    googleSetupToken: result.googleSetupToken,
    defaultInfo: result.defaultInfo,
  });
});

// [POST] /api/users/google-complete
exports.googleCompleteRegistration = asyncHandler(async (req, res) => {
  const { googleSetupToken, username, fullname, bio } = req.body;
  const result = await authService.googleCompleteRegistration({
    googleSetupToken,
    username,
    fullname,
    bio,
  });

  // Set cookie refreshToken
  res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  res.status(201).json({
    message: result.message,
    accessToken: result.accessToken,
    user: result.user,
  });
});

// [POST] /api/users/verify-email (Kích hoạt email OTP sau khi đăng ký)
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmailOtp({ email, otp });

  // Set cookie refreshToken
  res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

  res.json({
    message: result.message,
    accessToken: result.accessToken,
    user: result.user,
  });
});

// [POST] /api/users/resend-verification-otp (Gửi lại mã OTP kích hoạt)
exports.resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerificationOtp({ email });

  res.json(result);
});


