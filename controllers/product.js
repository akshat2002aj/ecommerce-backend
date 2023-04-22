const Product = require('../models/Product');

// @desc        Create Product
// @route       Get /api/v1/products
// @access      Private (admin only)
exports.createProduct = (req, res) => {
  res.json({ message: 'Success' }).status(200);
};

// @desc        Get all Products
// @route       Get /api/v1/products
// @access      Public
exports.getAllProducts = (req, res) => {
  res.json({ message: 'Success' }).status(200);
};
