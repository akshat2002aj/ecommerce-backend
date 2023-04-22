const express = require('express');
const {
  getAllProducts,
  createProduct,
  updateProducts,
  deleteProducts,
  getProductDetails,
} = require('../controllers/product');

const router = express.Router();

router.route('/').get(getAllProducts).post(createProduct);
router
  .route('/:productId')
  .get(getProductDetails)
  .put(updateProducts)
  .delete(deleteProducts);

module.exports = router;
