const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

// @desc    Admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ active: true });
    const totalOrders = await Order.countDocuments();
    const customerCount = await User.countDocuments({ role: 'customer' });
    const lowStockCount = await Product.countDocuments({ active: true, stock: { $lte: 10 } });

    const allOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        customerCount,
        lowStockCount,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get all products with pagination and stock
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: create product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      mrp,
      images,
      sizes,
      colors,
      stock,
      description,
      gender,
      tags,
      featured,
      trending,
      newArrival,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price),
      images: Array.isArray(images) && images.length ? images : [images || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80'],
      sizes: Array.isArray(sizes) && sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length ? colors : [{ name: 'Default', hex: '#191A18' }],
      stock: Number(stock) || 0,
      description: description || 'Premium WearStep apparel.',
      gender: gender || 'Unisex',
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      trending: Boolean(trending),
      newArrival: Boolean(newArrival),
      active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      category,
      price,
      mrp,
      images,
      sizes,
      colors,
      stock,
      description,
      gender,
      tags,
      featured,
      trending,
      newArrival,
      active,
    } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (images) product.images = Array.isArray(images) ? images : [images];
    if (sizes) product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map((s) => s.trim());
    if (colors) product.colors = colors;
    if (stock !== undefined) product.stock = Number(stock);
    if (description !== undefined) product.description = description;
    if (gender) product.gender = gender;
    if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : [];
    if (featured !== undefined) product.featured = Boolean(featured);
    if (trending !== undefined) product.trending = Boolean(trending);
    if (newArrival !== undefined) product.newArrival = Boolean(newArrival);
    if (active !== undefined) product.active = Boolean(active);

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted permanently',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get all orders with status filter
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    // If cancelled by admin, restore product stock if not already cancelled
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get customers with order counts and spend
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const customerData = await Promise.all(
      customers.map(async (c) => {
        const userOrders = await Order.find({ user: c._id });
        const spend = userOrders
          .filter((o) => o.orderStatus !== 'Cancelled')
          .reduce((sum, o) => sum + o.total, 0);

        return {
          id: c._id,
          name: c.name,
          email: c.email,
          orderCount: userOrders.length,
          totalSpend: spend,
          createdAt: c.createdAt,
        };
      })
    );

    res.json({
      success: true,
      count: customerData.length,
      customers: customerData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: create coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minimumOrder, maximumDiscount, expiryDate, usageLimit } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Code, discount type, and value are required' });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active: true,
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: get inventory overview
// @route   GET /api/admin/inventory
// @access  Private/Admin
exports.getInventory = async (req, res) => {
  try {
    const lowStock = await Product.find({ active: true, stock: { $lte: 10, $gt: 0 } }).sort({ stock: 1 });
    const outOfStock = await Product.find({ active: true, stock: 0 });

    res.json({
      success: true,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
