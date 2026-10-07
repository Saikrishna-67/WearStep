const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOtpEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'wearstep_super_secret_jwt_key_2026_premium_gold',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new customer (never admin)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer', // strictly customer
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if this is an admin trying to use customer login
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts must use the dedicated Admin Login portal.',
        isAdminAccount: true,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login (separate endpoint and validation)
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Strictly enforce role === 'admin'
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: That is a customer account. Please use Customer Login.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Admin session started. Welcome, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile + stats
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user order statistics
    const userOrders = await Order.find({ user: user._id });
    const orderCount = userOrders.length;
    const totalSpent = userOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        stats: {
          orderCount,
          totalSpent,
          wishlistCount: user.wishlist ? user.wishlist.length : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate Forgot Password - generate 6-digit OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success message to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a 6-digit verification code has been sent.',
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetOtpAttempts = 0;
    await user.save();

    // Send email asynchronously in background
    sendOtpEmail(user.email, otp, user.name).catch((err) => {
      console.error('[Email Warning]', err.message);
    });

    res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email. Please check your inbox.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP session. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      user.resetOtpHash = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Check rate limit attempts
    if (user.resetOtpAttempts >= 5) {
      user.resetOtpHash = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetOtpHash);
    if (!isMatch) {
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Invalid code. ${5 - user.resetOtpAttempts} attempts remaining.`,
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You may now reset your password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password with verified email OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification session. Please request a new code.' });
    }

    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetOtpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code. Please check your email.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetOtpHash = null;
    user.resetOtpExpiry = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Diagnose email sending on server
// @route   GET /api/auth/email-diagnostic
// @access  Public
exports.emailDiagnostic = async (req, res) => {
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim() || null;
  const emailPassRaw = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
  const emailPassSet = Boolean(emailPassRaw);
  const emailPassLength = emailPassRaw.length;

  const detectedProvider = brevoKey ? 'brevo (HTTP Port 443)' : resendKey ? 'resend (HTTP Port 443)' : emailPassSet ? 'smtp (Ports 587/465)' : 'none';

  const testEmail = req.query.to || emailUser || 'saikrish6901@gmail.com';
  const sendResult = await sendOtpEmail(testEmail, '999888', 'Diagnostic Test');

  res.json({
    detectedProvider,
    brevoKeySet: Boolean(brevoKey),
    resendKeySet: Boolean(resendKey),
    emailUser,
    emailPassSet,
    emailPassLength,
    testEmail,
    sendResult,
  });
};
