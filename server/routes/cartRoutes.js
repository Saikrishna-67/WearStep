const express = require('express');
const router = express.Router();
const { validateCart } = require('../controllers/cartController');

router.post('/validate', validateCart);

module.exports = router;
