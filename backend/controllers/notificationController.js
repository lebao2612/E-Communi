const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

// [GET] /api/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const result = await notificationService.getNotificationsForUser({
    userId: req.userId,
    page,
    limit,
  });

  res.status(200).json(result);
});

// [GET] /api/notifications/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.userId);
  res.status(200).json(result);
});

// [PATCH] /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead({
    userId: req.userId,
    notificationId: req.params.id,
  });

  res.status(200).json(result);
});

// [PATCH] /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.userId);
  res.status(200).json(result);
});
