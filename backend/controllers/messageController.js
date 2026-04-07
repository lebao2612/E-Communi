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

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
};
