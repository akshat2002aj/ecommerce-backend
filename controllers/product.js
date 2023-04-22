const Product = require('../models/Product');

// @desc        Create Product
// @route       POST /api/v1/products
// @access      Private (admin only)
exports.createProduct = async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
    message: 'Product created successfully',
  });
};

// @desc        Get all Products
// @route       Get /api/v1/products
// @access      Public
exports.getAllProducts = async (req, res) => {
  const products = await Product.find();

  res.status(200).json({ success: true, products });
};

// @desc        Get single Product
// @route       Get /api/v1/products/:productId
// @access      Public
exports.getProductDetails = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.status(200).json({ success: true, product });
};

// @desc        Update Product
// @route       PUT /api/v1/products/:productId
// @access      Private (admin only)
exports.updateProducts = async (req, res) => {
  let product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: 'Product not found',
    });
  }

  product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res
    .status(200)
    .json({ success: true, product, message: 'Product updated successfully' });
};

// @desc        Delete Product
// @route       DELETE /api/v1/products/:productId
// @access      Private (admin only)
exports.deleteProducts = async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: 'Product not found',
    });
  }

  await Product.findByIdAndRemove(req.params.productId);

  res.status(200).json({
    success: true,
    product: {},
    message: 'Product deleted successfully',
  });
};
