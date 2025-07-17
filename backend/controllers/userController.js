const User = require('../models/User');

// [POST] /api/users/register
exports.registerUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = new User({ username, email });
    await newUser.save();
    res.status(201).json({ message: '✅ User created', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// [GET] /api/users/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
