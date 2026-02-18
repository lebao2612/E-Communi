const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  generateAccessToken,
  generateRefreshToken
} = require('../utils/jwt');


// [GET] /api/users/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [GET] /api/users/:username
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// [POST] /api/users/register
exports.register = async (req, res) => {
  try {
    const { username, fullname, password, confirmPassword, avatar } = req.body;

    if (!username || !password || !confirmPassword || !fullname)
      return res.status(400).json({ error: 'Missing fields' });

    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,
      avatar: avatar || undefined
    });

    console.log('newUser created (before save): ', newUser);

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//[POST] /api/users/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid password' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// [POST] /api/users/refresh-token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ error: 'Invalid refresh token' });

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Token expired or invalid' });
  }
};

// [GET] /api/users/me
exports.getMe = async (req, res) => {
  try {
    //console.log("req.userId = ", req.userId);

    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const user = await User.findById(req.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [PUT] /api/users/update
exports.updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const allowedUpdates = ['fullname', 'bio', 'avatar', 'coverImage'];
    const actualUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, actualUpdates, { new: true }).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// [POST] /api/users/follow/:id
exports.followUser = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) return res.status(404).json({ error: 'User not found' });

    if (userToFollow.followers.some(id => id.toString() === req.userId)) {
      return res.status(400).json({ error: 'You are already following this user' });
    }

    await userToFollow.updateOne({ $push: { followers: req.userId } });
    await currentUser.updateOne({ $push: { following: req.params.id } });

    res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// [POST] /api/users/unfollow/:id
exports.unfollowUser = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) return res.status(404).json({ error: 'User not found' });

    if (!userToUnfollow.followers.some(id => id.toString() === req.userId)) {
      return res.status(400).json({ error: 'You are not following this user' });
    }

    await userToUnfollow.updateOne({ $pull: { followers: req.userId } });
    await currentUser.updateOne({ $pull: { following: req.params.id } });

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// [GET] /api/users/followers/:id
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username fullname avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });

    //console.log("Followers list: ", user.followers);

    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// [GET] /api/users/following/:id
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fullname avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });

    //console.log("Following list: ", user.following);

    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
