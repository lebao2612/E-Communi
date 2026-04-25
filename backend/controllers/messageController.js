const messageService = require('../services/messageService');
const asyncHandler = require('../utils/asyncHandler');

const sendMessage = asyncHandler(async (req, res) => {
  const result = await messageService.sendMessage({
    user1: req.validated.user1,
    user2: req.validated.user2,
    content: req.validated.content,
  });

  res.status(201).json(result);
});

const getMessagesBetweenUsers = asyncHandler(async (req, res) => {
  const result = await messageService.getMessagesBetweenUsers({
    user1: req.validated.user1,
    user2: req.validated.user2,
    limit: req.validated.limit,
    before: req.validated.before,
  });

  res.status(200).json(result);
});

const getUnreadSummary = asyncHandler(async (req, res) => {
  const result = await messageService.getUnreadSummary(req.userId);
  res.status(200).json(result);
});

const markConversationAsRead = asyncHandler(async (req, res) => {
  const result = await messageService.markConversationAsRead({
    friendId: req.validated.friendId,
    currentUserId: req.validated.currentUserId,
  });

  res.status(200).json(result);
});

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  getUnreadSummary,
  markConversationAsRead,
};
