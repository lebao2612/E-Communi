const rateLimit = require('express-rate-limit');

/**
 * Giới hạn request cho các route đăng nhập & đăng ký (chống Brute-force & bot spam)
 * Tối đa 10 lượt thử / 15 phút trên mỗi IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Quá nhiều lượt thử đăng nhập/đăng ký từ thiết bị của bạn. Vui lòng thử lại sau 15 phút.'
    }
});

/**
 * Giới hạn request gửi mã OTP qua Email (chống spam cạn quota Gmail/SMTP)
 * Tối đa 5 lượt yêu cầu / 15 phút trên mỗi IP
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Bạn đã yêu cầu gửi mã OTP quá nhiều lần. Vui lòng thử lại sau 15 phút.'
    }
});

/**
 * Giới hạn chung cho toàn bộ API (chống DoS / lạm dụng tài nguyên)
 * Tối đa 300 requests / 15 phút trên mỗi IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Hệ thống đang quá tải hoặc bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.'
    }
});

module.exports = {
    authLimiter,
    otpLimiter,
    generalLimiter,
};
