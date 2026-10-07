const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - customer or admin
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'wearstep_super_secret_jwt_key_2026_premium_gold'
      );
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found with this token' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};

// Optional auth (e.g. for guest checkout or reading wishlist/cart)
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'wearstep_super_secret_jwt_key_2026_premium_gold'
      );
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (e) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
