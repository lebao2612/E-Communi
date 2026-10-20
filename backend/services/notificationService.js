const Notification = require('../models/Notification');
const { getIO } = require('./realtimeService');
const { createHttpError, ensureObjectId } = require('../utils/errorHelpers');

/**
 * Create a new notification and emit realtime Socket.IO event if recipient is online
 */
const createNotification = async ({ recipientId, senderId, type, postId = null, commentId = null }) => {
  if (!recipientId || !senderId || !type) return null;

  // Don't notify oneself
  if (recipientId.toString() === senderId.toString()) {
    return null;
  }

  // Prevent duplicate unread notifications of the same type for the same item within short time
  if (type === 'like' && postId) {
    const existingLikeNotif = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      type: 'like',
      post: postId,
    });
    if (existingLikeNotif) {
      existingLikeNotif.createdAt = new Date();
      existingLikeNotif.read = false;
      await existingLikeNotif.save();
      await existingLikeNotif.populate('sender', 'username fullname avatar');
      await existingLikeNotif.populate('post', 'content images');

      const io = getIO();
      if (io) {
        io.to(recipientId.toString()).emit('new_notification', existingLikeNotif);
      }
      return existingLikeNotif;
    }
  }

  const notification = new Notification({
    recipient: recipientId,
    sender: senderId,
    type,
    post: postId,
    comment: commentId,
  });

  await notification.save();
  await notification.populate('sender', 'username fullname avatar');
  if (postId) {
    await notification.populate('post', 'content images');
  }

  // Realtime push notification via Socket.IO
  const io = getIO();
  if (io) {
    io.to(recipientId.toString()).emit('new_notification', notification);
  }

  return notification;
};

/**
 * Get paginated notifications for user
 */
const getNotificationsForUser = async ({ userId, page = 1, limit = 20 }) => {
  ensureObjectId(userId, 'userId');
  const skip = (page - 1) * limit;

  const query = { recipient: userId };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username fullname avatar')
      .populate('post', 'content images'),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return {
    notifications,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  ensureObjectId(userId, 'userId');
  const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
  return { unreadCount };
};

/**
 * Mark a single notification as read
 */
const markAsRead = async ({ userId, notificationId }) => {
  ensureObjectId(userId, 'userId');
  ensureObjectId(notificationId, 'notificationId');

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  )
    .populate('sender', 'username fullname avatar')
    .populate('post', 'content images');

  if (!notification) {
    throw createHttpError('Notification not found', 404);
  }

  const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

  return {
    notification,
    unreadCount,
  };
};

/**
 * Mark all unread notifications as read for user
 */
const markAllAsRead = async (userId) => {
  ensureObjectId(userId, 'userId');

  await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );

  return {
    message: 'All notifications marked as read',
    unreadCount: 0,
  };
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
