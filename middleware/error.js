const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal server error';

  // MonogDB ID Error
  if (err.name === 'CastError') {
    console.log(err);
    const message = `Resource not found`;
    err = new ErrorHandler(message, 404);
  }

  //Mongoose Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    err = new ErrorHandler(message, 400);
  }

  //JSON Web Token Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON WEN token is invalid, try again';
    err = new ErrorHandler(message, 400);
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = `Duplicate Field Value Entered`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
