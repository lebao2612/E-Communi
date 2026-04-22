const mongoose = require('mongoose');

const Message = require('../models/Message');

// Gửi tin nhắn giữa 2 user
const sendMessage = async (req, res) => {
  try {
    const { user1, user2, content } = req.body;

    if (!user1 || !user2 || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Kiểm tra ObjectId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
        return res.status(400).json({ message: 'Invalid user IDs' });
    }

    const newMessage = await Message.create({
      user1,
      user2,
      content,
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy tất cả tin nhắn giữa 2 user
const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const { before } = req.query;

    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }

    const baseFilter = {
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ]
    };

    let cursorFilter = {};
    if (before) {
      if (!mongoose.Types.ObjectId.isValid(before)) {
        return res.status(400).json({ message: 'Invalid cursor' });
      }
      cursorFilter = { _id: { $lt: new mongoose.Types.ObjectId(before) } };
    }

    const query = { ...baseFilter, ...cursorFilter };
    const fetchedMessages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    // Reverse to keep chat display order oldest -> newest.
    const messages = fetchedMessages.reverse();
    const oldestMessage = messages[0] || null;
    const hasMore = fetchedMessages.length === limit;

    res.status(200).json({
      message: 'Messages fetched successfully',
      data: messages,
      pagination: {
        limit,
        hasMore,
        nextCursor: oldestMessage ? oldestMessage._id : null,
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUnreadSummary = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const summary = await Message.aggregate([
      {
        $match: {
          user2: new mongoose.Types.ObjectId(currentUserId),
          isRead: { $ne: true },
        }
      },
      {
        $group: {
          _id: '$user1',
          count: { $sum: 1 },
        }
      }
    ]);

    const unreadCountByFriendId = summary.reduce((acc, row) => {
      acc[String(row._id)] = row.count;
      return acc;
    }, {});

    res.status(200).json({
      message: 'Unread summary fetched successfully',
      data: unreadCountByFriendId,
    });
  } catch (error) {
    console.error('Error fetching unread summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const currentUserId = req.userId;

    console.log('markConversationAsRead called:', { friendId, currentUserId, params: req.params });

    if (!friendId || !currentUserId) {
      return res.status(400).json({ message: 'Missing friendId or userId' });
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ message: 'Invalid current user ID' });
    }

    const result = await Message.updateMany(
      {
        user1: new mongoose.Types.ObjectId(friendId),
        user2: new mongoose.Types.ObjectId(currentUserId),
        isRead: { $ne: true },
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        }
      }
    );

    console.log('Update result:', result);

    res.status(200).json({
      message: 'Conversation marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      }
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  getUnreadSummary,
  markConversationAsRead,
};
