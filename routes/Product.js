const express = require('express');
const {
  getAllProducts,
  createProduct,
  updateProducts,
  deleteProducts,
  getProductDetails,
  createProductReview,
  deleteReview,
  getProductReviews,
} = require('../controllers/product');
const advanceResults = require('../middleware/advanceResults');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(advanceResults(Product), getAllProducts)
  .post(protect, authorize('admin'), createProduct);
router.route('/review').post(protect, createProductReview);
router.route('/reviews').get(getProductReviews).delete(protect, deleteReview);
router
  .route('/:productId')
  .get(getProductDetails)
  .put(protect, authorize('admin'), updateProducts)
  .delete(protect, authorize('admin'), deleteProducts);

module.exports = router;
