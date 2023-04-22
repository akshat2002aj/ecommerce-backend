const express = require('express');

const app = express();

//Route Files
const Product = require('./routes/Product');

// Body Parser
app.use(express.json());

// Mount routers
app.use('/api/v1/products', Product);

module.exports = app;
