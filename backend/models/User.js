const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  fullname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    //required: true,
    //unique: true,
  },

  password: {
    type: String,
    required: true
  },

  refreshToken: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },

  coverImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },

  bio: {
    type: String,
    default: ""
  },

  socialLinks: {
    type: Array,
    default: []
  },


});

module.exports = mongoose.model('User', userSchema);
