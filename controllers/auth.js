const User = require('../models/User');
const AsyncHandler = require('../middleware/async');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc        Register user
// @route       Get /api/v1/auth/register
// @access      Public
exports.register = AsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'Sample Id',
      url: 'Url',
    },
  });

  //   console.log(user.getSignedJwtToken());
  sendTokenResponse(user, 200, res);
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Vslidate Email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please Provide an email and password`, 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    next(new ErrorHandler(`Invalid credentials`, 401));
  }

  // Check if Password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorHandler(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  //   if (process.env.NODE_ENV === 'production') {
  //     options.secure = true;
  //   }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    message: 'Logged in successfully',
  });
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = AsyncHandler(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});

// @desc        Forgot password
// @route       POST /api/v1/auth/forgetpassword
// @access      Public
exports.forgetPassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('There is not user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  console.log(1);
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  // Create reset Url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}\n\n If you haven't requested the reset password, then please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Ecommerce Password Recovery',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent successfully' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler('Email could not be send.', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Reset Password
// @route       GUT /api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = AsyncHandler(async (req, res, next) => {
  // Get hashed token
  console.log(123456);
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  console.log(resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    next(new ErrorHandler('Invalid Token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc        Get current logged in user
// @route       GET /api/v1/auth/me
// @access      Private
exports.getMe = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Update password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check cureent password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorHandler(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = AsyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});
