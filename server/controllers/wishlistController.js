const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);

    let added = false;
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      message: added ? 'Added to wishlist' : 'Removed from wishlist',
      added,
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
