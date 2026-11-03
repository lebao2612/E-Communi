/**
 * Cấu hình an toàn cho httpOnly Cookie lưu Refresh Token
 */
const getRefreshTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,                   // Chỉ gửi qua HTTPS khi ở production
        sameSite: isProduction ? 'none' : 'lax', // 'none' cho phép FE Vercel và BE Render gửi cookie chéo domain
        maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 ngày
        path: '/',
    };
};

module.exports = {
    getRefreshTokenCookieOptions,
};
