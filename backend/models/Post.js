const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    images: [{
        type: String,
    }],

    content: {
        type: String,
        required: true,
    },

    privacy: {
        type: String,
        enum: ['public', 'followers'],
        default: 'public'
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

module.exports = mongoose.model('Post', postSchema);