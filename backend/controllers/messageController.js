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

    const messages = await Message.find({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ]
    }).sort({ sentAt: 1 }); // sắp xếp theo thời gian gửi

    res.status(200).json({
      message: 'Messages fetched successfully',
      data: messages,
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
