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

// [GET] /api/users/:username
exports.getUserByUsername = async (req, res) =>{
  const {username} = req.params;
  
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
  try{
    const {fullname, user, email} = req.body;

    const existingUser = await User.findOne({username});
    if(existingUser){
      return res.status(400).json({error: 'User already exists'});
    }

    const newUser = new User({fullname, user, email});
    await newUser.save();

    res.status(201).json({message: 'User registered successfully', user: newUser});
  } catch{
    res.status(500).json({error: err.message});
  }
};

//[POST] /api/users/login
exports.login = async (req, res) => {
  try{
    const {username} = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({username});
    if(!user){
      return res.status(404).json({error: 'User not found'});
    }

    res.status(200).json({message: 'Login successful', user});

  } catch{
    res.status(500).json({error: err.message});
  }
}


