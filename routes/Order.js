const express = require('express');
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/order');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/').post(protect, newOrder).get(protect, myOrders);
router.route('/admin').get(protect, authorize('admin'), getAllOrders);
router
  .route('/admin/:id')
  .put(protect, authorize('admin'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);
router.route('/:id').get(protect, getSingleOrder);

module.exports = router;
