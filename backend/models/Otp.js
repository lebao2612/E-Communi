const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['FORGOT_PASSWORD', 'VERIFY_EMAIL'],
        default: 'FORGOT_PASSWORD',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // Tự động xóa sau 600 giây (10 phút) bằng MongoDB TTL Index
    },
});

module.exports = mongoose.model('Otp', otpSchema);
