const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getOffers,
  getProductById,
  addProductReview,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/offers', getOffers);
router.get('/:id', getProductById);
router.post('/:id/review', protect, addProductReview);

module.exports = router;
