const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const AsyncHandler = require('../middleware/async');

// @desc        Create Product
// @route       POST /api/v1/products
// @access      Private (admin only)
exports.createProduct = AsyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
    message: 'Product created successfully',
  });
});

// @desc        Get all Products
// @route       Get /api/v1/products
// @access      Public
exports.getAllProducts = AsyncHandler(async (req, res, next) => {
  // const resultPerPage = 5;
  // const productCount = await Product.countDocuments();
  // const apiFeatures = new ApiFeatures(Product.find(), req.query)
  //   .search()
  //   .filter()
  //   .pagination(resultPerPage);
  // const products = await apiFeatures.query;
  // res.status(200).json({ success: true, products, count: productCount });
  res.status(200).json(res.advancedResults);
});

// @desc        Get single Product
// @route       Get /api/v1/products/:productId
// @access      Public
exports.getProductDetails = AsyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({ success: true, product });
});

// @desc        Update Product
// @route       PUT /api/v1/products/:productId
// @access      Private (admin only)
exports.updateProducts = AsyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res
    .status(200)
    .json({ success: true, product, message: 'Product updated successfully' });
});

// @desc        Delete Product
// @route       DELETE /api/v1/products/:productId
// @access      Private (admin only)
exports.deleteProducts = AsyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  await Product.findByIdAndRemove(req.params.productId);

  res.status(200).json({
    success: true,
    product: {},
    message: 'Product deleted successfully',
  });
});

// @desc        Create review
// @route       POST /api/v1/products/review
// @access      Private
exports.createProductReview = AsyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Product Review created successfully',
  });
});

// Get All Reviews of a product
exports.getProductReviews = AsyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = AsyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numberOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
