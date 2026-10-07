require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10'];

const seedProducts = [
  {
    name: 'Concrete Trail Jacket',
    category: 'Jackets & Hoodies',
    gender: 'Unisex',
    price: 3499,
    mrp: 4499,
    rating: 4.5,
    ratingCount: 212,
    newArrival: true,
    featured: true,
    trending: true,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Ink', hex: '#191A18' },
      { name: 'Olive', hex: '#5B6650' },
      { name: 'Rust', hex: '#C1440E' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700&q=80',
    ],
    description:
      'A weatherproof shell cut for the commute. Sealed seams, a packable hood, and a boxy fit that layers clean over anything.',
    stock: 24,
    tags: ['jacket', 'waterproof', 'outerwear', 'trail'],
  },
  {
    name: 'Pavement Runner 2.0',
    category: "Men's Shoes",
    gender: 'Men',
    price: 4199,
    mrp: 5249,
    rating: 4.6,
    ratingCount: 388,
    newArrival: false,
    featured: true,
    trending: true,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'White', hex: '#F4F2EC' },
      { name: 'Black', hex: '#191A18' },
    ],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80',
    ],
    description:
      'Our most-returned-to sneaker, now with a softer midsole. Built to hold up over long city miles without breaking down.',
    stock: 41,
    tags: ['shoes', 'sneakers', 'running', 'comfort'],
  },
  {
    name: 'Ink Wash Denim',
    category: 'Jeans & Trousers',
    gender: 'Men',
    price: 2299,
    mrp: 2699,
    rating: 4.3,
    ratingCount: 156,
    newArrival: false,
    featured: true,
    trending: false,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Indigo', hex: '#2B3A55' },
      { name: 'Black', hex: '#191A18' },
    ],
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&q=80',
    ],
    description:
      'A straight-leg denim in a deep ink wash. Stretch woven into the fabric so it moves the way you do, all day.',
    stock: 33,
    tags: ['jeans', 'denim', 'trousers', 'stretch'],
  },
  {
    name: 'Signal Low-Top',
    category: "Men's Shoes",
    gender: 'Men',
    price: 3899,
    mrp: 3899,
    rating: 4.4,
    ratingCount: 97,
    newArrival: true,
    featured: true,
    trending: true,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'White/Gold', hex: '#F4CD6A' },
      { name: 'Grey', hex: '#8a8f8c' },
    ],
    images: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=700&q=80',
      'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=700&q=80',
    ],
    description:
      'A clean low-top with a golden accent stripe. Goes from desk to street without missing a beat.',
    stock: 18,
    tags: ['sneakers', 'low-top', 'leather', 'gold'],
  },
  {
    name: 'Ink Crewneck Tee',
    category: "Women's Clothing",
    gender: 'Women',
    price: 1199,
    mrp: 1199,
    rating: 4.1,
    ratingCount: 64,
    newArrival: false,
    featured: false,
    trending: false,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Black', hex: '#191A18' },
      { name: 'Chalk', hex: '#FBFAF7' },
      { name: 'Rust', hex: '#C1440E' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80&sat=-100',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
    ],
    description:
      'Heavyweight cotton, garment-dyed for a worn-in look from day one. The everyday tee that actually holds its shape.',
    stock: 52,
    tags: ['tshirt', 'crewneck', 'cotton', 'basics'],
  },
  {
    name: 'Rust Windbreaker',
    category: 'Jackets & Hoodies',
    gender: 'Unisex',
    price: 2999,
    mrp: 3799,
    rating: 4.2,
    ratingCount: 143,
    newArrival: false,
    featured: true,
    trending: true,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Rust', hex: '#C1440E' },
      { name: 'Ink', hex: '#191A18' },
    ],
    images: [
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700&q=80',
      'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80',
    ],
    description:
      'Lightweight, packable, and cut long in the back. Built for the exact moment the weather turns.',
    stock: 29,
    tags: ['windbreaker', 'jacket', 'packable', 'weatherproof'],
  },
  {
    name: 'Chalk Cargo Pants',
    category: 'Jeans & Trousers',
    gender: 'Men',
    price: 2599,
    mrp: 2599,
    rating: 4.0,
    ratingCount: 71,
    newArrival: false,
    featured: false,
    trending: false,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Chalk', hex: '#DAD7CE' },
      { name: 'Olive', hex: '#5B6650' },
    ],
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
      'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=700&q=80',
    ],
    description:
      'Utility cargo pants with a tapered leg so they still read sharp. Reinforced pockets built to actually carry things.',
    stock: 20,
    tags: ['cargo', 'trousers', 'utility', 'pants'],
  },
  {
    name: 'Grit High-Top',
    category: "Men's Shoes",
    gender: 'Men',
    price: 4499,
    mrp: 5599,
    rating: 4.7,
    ratingCount: 265,
    newArrival: true,
    featured: true,
    trending: true,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'Black', hex: '#191A18' },
      { name: 'Tan', hex: '#B08050' },
    ],
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=80',
      'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=700&q=80',
    ],
    description:
      'A rugged high-top with ankle support for longer days on your feet. Grippy sole, reinforced toe.',
    stock: 15,
    tags: ['boots', 'high-top', 'leather', 'shoes'],
  },
  {
    name: 'Studio Wrap Dress',
    category: "Women's Clothing",
    gender: 'Women',
    price: 2899,
    mrp: 3399,
    rating: 4.4,
    ratingCount: 88,
    newArrival: true,
    featured: false,
    trending: true,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Black', hex: '#191A18' },
      { name: 'Rust', hex: '#C1440E' },
    ],
    images: [
      'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80',
    ],
    description:
      'A soft jersey wrap dress that moves easily from desk to dinner. Adjustable tie waist, breathable fabric.',
    stock: 27,
    tags: ['dress', 'wrap', 'jersey', 'women'],
  },
  {
    name: 'Ease Slide Sandal',
    category: 'Slippers & Sandals',
    gender: 'Unisex',
    price: 1299,
    mrp: 1599,
    rating: 4.2,
    ratingCount: 132,
    newArrival: false,
    featured: false,
    trending: false,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'Black', hex: '#191A18' },
      { name: 'Sand', hex: '#DAD0B8' },
    ],
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80',
    ],
    description:
      'A cushioned slide for recovery days and errand runs. Quick-dry footbed, grippy outsole.',
    stock: 38,
    tags: ['sandals', 'slides', 'cushioned', 'footwear'],
  },
  {
    name: 'Harbor Hoodie',
    category: 'Jackets & Hoodies',
    gender: 'Unisex',
    price: 1999,
    mrp: 2499,
    rating: 4.5,
    ratingCount: 174,
    newArrival: false,
    featured: true,
    trending: true,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Grey', hex: '#8a8f8c' },
      { name: 'Ink', hex: '#191A18' },
      { name: 'Gold', hex: '#D4A64A' },
    ],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80',
    ],
    description:
      'Brushed fleece hoodie with a kangaroo pocket and a relaxed cut. The one you reach for on cold mornings.',
    stock: 46,
    tags: ['hoodie', 'sweatshirt', 'fleece', 'streetwear'],
  },
  {
    name: 'City Trainer',
    category: "Women's Shoes",
    gender: 'Women',
    price: 3699,
    mrp: 4099,
    rating: 4.3,
    ratingCount: 109,
    newArrival: true,
    featured: true,
    trending: false,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'White', hex: '#F4F2EC' },
      { name: 'Blush', hex: '#E7C9C0' },
    ],
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80',
      'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=700&q=80',
    ],
    description:
      'A minimal trainer with a cushioned sole for standing all day and walking further than planned.',
    stock: 22,
    tags: ['shoes', 'sneakers', 'trainer', 'women'],
  },
  {
    name: 'Flex Flip Flop',
    category: 'Slippers & Sandals',
    gender: 'Unisex',
    price: 599,
    mrp: 899,
    rating: 3.9,
    ratingCount: 58,
    newArrival: false,
    featured: false,
    trending: false,
    sizes: SHOE_SIZES,
    colors: [
      { name: 'Navy', hex: '#2B3A55' },
      { name: 'Black', hex: '#191A18' },
    ],
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700&q=80',
    ],
    description:
      'A simple, durable flip flop for the beach, the shower, or just around the house.',
    stock: 60,
    tags: ['flip-flop', 'sandals', 'beach', 'footwear'],
  },
  {
    name: 'Tapered Trouser',
    category: 'Jeans & Trousers',
    gender: 'Men',
    price: 2199,
    mrp: 2699,
    rating: 4.1,
    ratingCount: 47,
    newArrival: false,
    featured: false,
    trending: false,
    sizes: CLOTHING_SIZES,
    colors: [
      { name: 'Charcoal', hex: '#3A3B38' },
      { name: 'Chalk', hex: '#DAD7CE' },
    ],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&q=80',
    ],
    description:
      'A smart-casual tapered trouser that works as easily with sneakers as it does with loafers.',
    stock: 31,
    tags: ['trouser', 'pants', 'tapered', 'smart-casual'],
  },
];

const sampleReviews = [
  { user: 'Aarav K.', rating: 5, comment: 'Great fit and the fabric feels durable. Wore it daily for two weeks, holds up well.' },
  { user: 'Meera S.', rating: 4, comment: 'True to size. Delivery was quick and packaging was neat.' },
  { user: 'Rohit P.', rating: 4, comment: 'Good quality for the price. Color is slightly different from photos but still nice.' },
  { user: 'Sana I.', rating: 5, comment: 'Comfortable all day. Ordered a second one in another colour.' },
  { user: 'Devika R.', rating: 4, comment: 'Solid stitching, no loose threads. Would recommend for everyday wear.' },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wearstep';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to ${mongoUri}`);

    // Clear existing records
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await Banner.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // 1. Seed Users (passwords hashed with bcrypt)
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('demo123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    const demoUser = await User.create({
      name: 'Demo Customer',
      email: 'demo@wearstep.com',
      passwordHash: demoPasswordHash,
      role: 'customer',
    });

    const adminUser = await User.create({
      name: 'Store Administrator',
      email: 'admin@wearstep.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });
    console.log('[Seed] Seeded Users: demo@wearstep.com and admin@wearstep.com (admin)');

    // 2. Seed Products with reviews
    const createdProducts = [];
    for (const prodData of seedProducts) {
      const prod = new Product({
        ...prodData,
        reviews: sampleReviews.map((r, i) => ({
          ...r,
          userId: demoUser._id,
          createdAt: new Date(Date.now() - (i + 1) * 86400000 * 3),
        })),
      });
      await prod.save();
      createdProducts.push(prod);
    }
    console.log(`[Seed] Seeded ${createdProducts.length} products`);

    // 3. Seed Coupons
    await Coupon.create([
      {
        code: 'WEARSTEP10',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrder: 1500,
        maximumDiscount: 500,
        usageLimit: 1000,
        active: true,
      },
      {
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        minimumOrder: 2000,
        maximumDiscount: 1000,
        usageLimit: 500,
        active: true,
      },
      {
        code: 'FASHION500',
        discountType: 'fixed',
        discountValue: 500,
        minimumOrder: 3000,
        maximumDiscount: 500,
        usageLimit: 200,
        active: true,
      },
    ]);
    console.log('[Seed] Seeded coupons: WEARSTEP10, WELCOME20, FASHION500');

    // 4. Seed Banners
    await Banner.create([
      {
        title: 'STEP INTO IT.',
        subtitle: 'New drop — Autumn / Winter 01',
        description: 'Clothing and footwear built for people who move. Every stitch tested on real streets, not runways.',
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700&q=80',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        category: 'All',
        displayOrder: 1,
        active: true,
      },
    ]);
    console.log('[Seed] Seeded homepage banners');

    // 5. Seed Sample Orders for demo user
    const sampleItems = [
      {
        product: createdProducts[0]._id,
        name: createdProducts[0].name,
        image: createdProducts[0].images[0],
        size: 'L',
        color: 'Rust',
        price: createdProducts[0].price,
        quantity: 1,
      },
      {
        product: createdProducts[1]._id,
        name: createdProducts[1].name,
        image: createdProducts[1].images[0],
        size: 'UK8',
        color: 'Black',
        price: createdProducts[1].price,
        quantity: 1,
      },
    ];

    const order1Subtotal = sampleItems[0].price + sampleItems[1].price;
    await Order.create({
      orderId: 'WS1001',
      user: demoUser._id,
      customerName: demoUser.name,
      customerEmail: demoUser.email,
      items: sampleItems,
      subtotal: order1Subtotal,
      discount: 0,
      shipping: 0,
      coupon: { code: null, discountAmount: 0 },
      total: order1Subtotal,
      shippingAddress: {
        fullName: 'Demo Customer',
        address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        phone: '9876543210',
      },
      paymentMethod: 'upi',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      createdAt: new Date(Date.now() - 86400000 * 2),
    });

    const order2Item = [
      {
        product: createdProducts[4]._id,
        name: createdProducts[4].name,
        image: createdProducts[4].images[0],
        size: 'M',
        color: 'Black',
        price: createdProducts[4].price,
        quantity: 2,
      },
    ];
    const order2Subtotal = createdProducts[4].price * 2;
    await Order.create({
      orderId: 'WS1002',
      user: demoUser._id,
      customerName: demoUser.name,
      customerEmail: demoUser.email,
      items: order2Item,
      subtotal: order2Subtotal,
      discount: 0,
      shipping: 0,
      coupon: { code: null, discountAmount: 0 },
      total: order2Subtotal,
      shippingAddress: {
        fullName: 'Demo Customer',
        address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        phone: '9876543210',
      },
      paymentMethod: 'card',
      paymentStatus: 'Paid',
      orderStatus: 'Placed',
      createdAt: new Date(),
    });

    console.log('[Seed] Seeded sample orders WS1001 and WS1002');
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
}

seedDatabase();
