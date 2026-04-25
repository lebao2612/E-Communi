const jwt = require('jsonwebtoken');
const { createHttpError } = require('../utils/errorHelpers');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createHttpError('No authorization header', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(createHttpError('No token provided', 401));
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      return next(createHttpError('Invalid token', 403));
    }
    req.userId = payload.userId;
    next();
  });
};
