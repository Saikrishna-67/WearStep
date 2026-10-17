const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    resetOtpHash: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },
    resetOtpAttempts: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    recoveryPin: {
      type: String,
      default: '1234',
      trim: true,
    },
    securityQuestion: {
      type: String,
      default: 'What is your registered name?',
    },
    securityAnswer: {
      type: String,
      default: '',
      trim: true,
    },
    isAccessGranted: {
      type: Boolean,
      default: true,
    },
    specialKey: {
      type: String,
      default: function () {
        return 'WS-' + Math.floor(100000 + Math.random() * 900000);
      },
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
