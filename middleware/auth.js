const jwt = require('jsonwebtoken');
const AsyncHandler = require('./async');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');

// Protect Route
exports.protect = AsyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  // Make sure token exists
  if (!token) {
    return next(new ErrorHandler('Not authorize to access this route', 401));
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorHandler('Not authorize to access this route', 401));
  }
});

// Grant access to specific role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
