const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to generate readable sequential Order ID like WS1001
const generateOrderId = async () => {
  const count = await Order.countDocuments();
  return `WS${1001 + count}`;
};

// @desc    Create new order with server-side stock, price and coupon validation
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Complete delivery details are required' });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Verify each item against real database prices and stock
    for (const item of items) {
      const product = await Product.findById(item.id || item.product);

      if (!product || !product.active) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" is no longer available.`,
        });
      }

      const qty = Number(item.qty || item.quantity) || 1;

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      // Decrement stock
      product.stock -= qty;
      await product.save();

      const lineTotal = product.price * qty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: item.size || 'Standard',
        color: item.color || 'Standard',
        price: product.price, // strict server price
        quantity: qty,
      });
    }

    // Server-calculated shipping: Free if subtotal >= 2000, else 99
    const shipping = calculatedSubtotal >= 2000 ? 0 : 99;

    // Validate Coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code, active: true });

      if (coupon) {
        const now = new Date();
        const isValidDate = (!coupon.startDate || now >= coupon.startDate) && (!coupon.expiryDate || now <= coupon.expiryDate);
        const isUnderLimit = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        const meetsMinOrder = calculatedSubtotal >= coupon.minimumOrder;

        if (isValidDate && isUnderLimit && meetsMinOrder) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
              discountAmount = coupon.maximumDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }

          coupon.usageCount += 1;
          await coupon.save();

          appliedCoupon = {
            code: coupon.code,
            discountAmount,
          };
        }
      }
    }

    const total = Math.max(0, calculatedSubtotal + shipping - discountAmount);
    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      user: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      shipping,
      coupon: appliedCoupon || { code: null, discountAmount: 0 },
      total,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        pincode: shippingAddress.pincode.trim(),
        phone: shippingAddress.phone.trim(),
      },
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure customer owns order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (eligible only if status === 'Placed')
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure customer owns order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order' });
    }

    if (order.orderStatus !== 'Placed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}.`,
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore stock to products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
