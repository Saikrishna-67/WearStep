const Product = require('../models/Product');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      isNew,
      onSale,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 24,
    } = req.query;

    const query = { active: true };

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Gender filter
    if (gender && gender !== 'All') {
      query.gender = gender;
    }

    // New Arrivals filter
    if (isNew === 'true' || isNew === true) {
      query.newArrival = true;
    }

    // On Sale filter (discount > 0)
    if (onSale === 'true' || onSale === true) {
      query.discount = { $gt: 0 };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search term (name, brand, category, tags)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'priceLow') sortOptions = { price: 1 };
    else if (sort === 'priceHigh') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'relevance' && search) {
      // Keep default
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 24;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true, featured: true })
      .limit(8)
      .sort({ rating: -1 });

    // Fallback if none marked featured yet
    if (products.length === 0) {
      const fallback = await Product.find({ active: true })
        .limit(6)
        .sort({ rating: -1 });
      return res.json({ success: true, products: fallback });
    }

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get new arrivals rail
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ active: true, newArrival: true })
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's offers / on sale
// @route   GET /api/products/offers
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const products = await Product.find({ active: true, discount: { $gt: 0 } })
      .limit(8)
      .sort({ discount: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products in the same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      active: true,
    })
      .limit(3)
      .sort({ rating: -1 });

    res.json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/review
// @access  Private
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const review = {
      user: req.user.name,
      userId: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    product.reviews.unshift(review);
    product.ratingCount = product.reviews.length;
    product.rating = Number(
      (
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      ).toFixed(1)
    );

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
