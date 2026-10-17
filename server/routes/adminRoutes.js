const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getCustomers,
  toggleCustomerAccess,
  regenerateCustomerKey,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getInventory,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getCustomers);
router.put('/customers/:id/access', toggleCustomerAccess);
router.post('/customers/:id/regenerate-key', regenerateCustomerKey);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/inventory', getInventory);

module.exports = router;
