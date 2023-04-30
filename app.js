const express = require('express');
const ErrorHandler = require('./middleware/error');

const cookieParser = require('cookie-parser');

const app = express();

//Route Files
const Product = require('./routes/Product');
const Auth = require('./routes/Auth');
const User = require('./routes/User');
const Order = require('./routes/Order');

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/products', Product);
app.use('/api/v1/auth', Auth);
app.use('/api/v1/users', User);
app.use('/api/v1/orders', Order);

// Middleware For Error Handling
app.use(ErrorHandler);

module.exports = app;
