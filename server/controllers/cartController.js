const Product = require('../models/Product');

// @desc    Validate cart and calculate accurate server-side totals
// @route   POST /api/cart/validate
// @access  Public
exports.validateCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({
        success: true,
        lines: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      });
    }

    const validatedLines = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.id || item.product);
      if (product && product.active) {
        const qty = Math.min(Number(item.qty) || 1, product.stock > 0 ? product.stock : 1);
        const lineTotal = product.price * qty;
        subtotal += lineTotal;

        validatedLines.push({
          id: product._id,
          name: product.name,
          image: product.images[0] || '',
          price: product.price,
          mrp: product.mrp,
          size: item.size || 'Standard',
          color: item.color || 'Standard',
          qty,
          stock: product.stock,
          isLowStock: product.stock > 0 && product.stock <= 5,
          isOutOfStock: product.stock === 0,
          lineTotal,
        });
      }
    }

    const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping;

    res.json({
      success: true,
      lines: validatedLines,
      subtotal,
      shipping,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
