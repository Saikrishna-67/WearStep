const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode, active: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ success: false, message: 'Coupon is not active yet' });
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minimumOrder.toLocaleString('en-IN')} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
