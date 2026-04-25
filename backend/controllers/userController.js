const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');


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
  const result = await userService.register({
    username: req.validated.username,
    fullname: req.validated.fullname,
    password: req.validated.password,
    confirmPassword: req.validated.confirmPassword,
    avatar: req.validated.avatar,
  });

  res.status(201).json(result);
});

//[POST] /api/users/login
exports.login = asyncHandler(async (req, res) => {
  const result = await userService.login({
    username: req.validated.username,
    password: req.validated.password,
  });

  res.json(result);
});

// [POST] /api/users/refresh-token
exports.refreshToken = asyncHandler(async (req, res) => {
  const result = await userService.refreshToken(req.validated.refreshToken);
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

//[POST] /api/users/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await userService.forgotPassword(req.validated.username);
  res.json(result);
});

//[POST] /api/users/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await userService.resetPassword({
    token: req.validated.token,
    password: req.validated.password,
  });

  res.json(result);
});
