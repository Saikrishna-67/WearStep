const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: 'WearStep',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      default: 'Unisex',
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: 0,
    },
    mrp: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    discount: {
      type: Number,
      default: 0, // % discount calculated or stored
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: ['M', 'L', 'XL'],
    },
    colors: {
      type: [colorSchema],
      default: [{ name: 'Default', hex: '#191A18' }],
    },
    stock: {
      type: Number,
      default: 20,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto calculate discount percentage before save
productSchema.pre('save', function (next) {
  if (this.mrp && this.mrp > this.price) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
