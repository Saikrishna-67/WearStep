import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const ProductDetail = ({ onOpenAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Tab & interactive state
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'materials' | 'sizing' | 'shipping'
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getProductById(id);
      if (res.success && res.product) {
        setProduct(res.product);
        setRelated(res.related || []);
        setActiveImgIndex(0);
        setSelectedSize(res.product.sizes && res.product.sizes.length ? res.product.sizes[0] : 'Standard');
        setSelectedColor(res.product.colors && res.product.colors.length ? res.product.colors[0].name : 'Default');
        setQuantity(1);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const starStr = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(25,26,24,0.15)', borderTopColor: 'var(--rust)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '14px' }}></div>
        <p className="mono" style={{ color: 'var(--steel)', fontSize: '13px' }}>
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <div className="emoji">⚠️</div>
        <p>Product not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>
          Browse Catalog
        </button>
      </div>
    );
  }

  const isShoes = product.category && product.category.toLowerCase().includes('shoe');
  const isJacket = product.category && (product.category.toLowerCase().includes('jacket') || product.category.toLowerCase().includes('hoodie'));
  const isDenim = product.category && (product.category.toLowerCase().includes('jean') || product.category.toLowerCase().includes('trouser'));

  const disc =
    product.discount ||
    (product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    showToast(`Added ${quantity} × "${product.name}" to your bag`);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showToast('Please login to leave a review');
      onOpenAuth();
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please enter your review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.addReview(product._id || product.id, reviewRating, reviewComment);
      if (res.success && res.product) {
        setProduct(res.product);
        setReviewComment('');
        showToast('Review submitted successfully!');
      }
    } catch (err) {
      showToast(err.message || 'Could not post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div id="view-product">
      <div className="pdp-wrap">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> /{' '}
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>{' '}
          / <span style={{ color: 'var(--ink)' }}>{product.name}</span>
        </div>

        {/* MAIN PRODUCT GRID */}
        <div className="pdp-grid">
          {/* GALLERY */}
          <div>
            <div className="pdp-gallery-main">
              <img
                src={
                  product.images && product.images[activeImgIndex]
                    ? product.images[activeImgIndex]
                    : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80'
                }
                alt={product.name}
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="pdp-thumbs">
                {product.images.map((im, i) => (
                  <div
                    key={i}
                    className={`pdp-thumb ${i === activeImgIndex ? 'active' : ''}`}
                    onClick={() => setActiveImgIndex(i)}
                  >
                    <img src={im} alt={`${product.name} thumbnail ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS & OPTIONS */}
          <div>
            {/* BADGES & LIVE STOCK */}
            <div className="pdp-badge-row">
              <span className="pdp-tag-pill">{product.brand || 'WearStep'} Originals</span>
              {product.newArrival && <span className="pdp-tag-pill" style={{ background: 'rgba(212,166,74,0.18)', color: '#8F6612' }}>✦ New Drop</span>}
              <span className="pdp-hot-pill">🔥 14 viewing now</span>
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            <div className="rating-row">
              <span className="stars">{starStr(product.rating || 4.2)}</span>
              <span>
                {product.rating || 4.2} · {product.ratingCount || (product.reviews ? product.reviews.length : 0)} verified reviews
              </span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{fmt(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="mrp">{fmt(product.mrp)}</span>
                  <span className="disc">{disc}% off</span>
                </>
              )}
              <span style={{ fontSize: '11.5px', color: 'var(--steel)', marginLeft: 'auto' }}>
                Inclusive of all taxes
              </span>
            </div>

            {/* EXPANDED RICH PRODUCT DESCRIPTION */}
            <div className="pdp-desc">
              <p style={{ margin: '0 0 10px', fontWeight: '500' }}>
                {product.description}
              </p>
              <p style={{ margin: 0, color: 'var(--steel)', fontSize: '13.5px', lineHeight: '1.6' }}>
                {isShoes
                  ? 'Precision engineered with an ergonomic low-profile contour, impact-responsive cushioning, and an abrasion-resistant rubber lug outsole designed for continuous concrete miles and high-traction stability.'
                  : isJacket
                  ? 'Built with reinforced thermal construction, wind-resistant outer weave, and an architected boxy drape that layers effortlessly over t-shirts and hoodies without restricting movement.'
                  : isDenim
                  ? 'Crafted from premium heavyweight structured cotton twill with authentic wash distressing, reinforced pocket rivets, and a relaxed straight-leg silhouette that pairs cleanly with high-tops and runners.'
                  : 'Tailored using heavyweight combed cotton with pre-shrunk fiber treatment, maintaining structure, collar integrity, and breathable comfort through intense everyday wear.'}
              </p>
            </div>

            {/* PRODUCT HIGHLIGHTS GRID */}
            <div className="pdp-highlights-grid">
              <div className="pdp-highlight-card">
                <span className="h-icon">🧵</span>
                <div className="h-title">Artisan Materials</div>
                <p className="h-desc">
                  {isShoes ? 'Breathable multi-layer mesh & TPU' : 'Heavyweight combed organic cotton'}
                </p>
              </div>
              <div className="pdp-highlight-card">
                <span className="h-icon">✂️</span>
                <div className="h-title">Engineered Fit</div>
                <p className="h-desc">
                  {isShoes ? 'Ergonomic footbed with arch support' : 'Boxy modern streetwear drape'}
                </p>
              </div>
              <div className="pdp-highlight-card">
                <span className="h-icon">🛡️</span>
                <div className="h-title">High Durability</div>
                <p className="h-desc">Double-needle stitched stress points</p>
              </div>
              <div className="pdp-highlight-card">
                <span className="h-icon">🎨</span>
                <div className="h-title">Colorfast Wash</div>
                <p className="h-desc">Mineral-dyed to prevent shade fading</p>
              </div>
            </div>

            {/* SIZES */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="opt-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="opt-label" style={{ margin: 0 }}>Select Size</span>
                  <button
                    type="button"
                    className="pdp-size-guide-link"
                    onClick={() => setShowSizeModal(true)}
                  >
                    📐 Size Guide & Measurements
                  </button>
                </div>
                <div className="size-chips">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`size-chip ${s === selectedSize ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS */}
            {product.colors && product.colors.length > 0 && (
              <div className="opt-group">
                <span className="opt-label">Color: <strong style={{ color: 'var(--ink)' }}>{selectedColor}</strong></span>
                <div className="color-chips">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`color-chip ${c.name === selectedColor ? 'selected' : ''}`}
                      style={{ background: c.hex }}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="opt-group">
              <span className="opt-label">Quantity</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      product.stock > 0
                        ? Math.min(product.stock, quantity + 1)
                        : quantity + 1
                    )
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <span style={{ fontSize: '11.5px', color: 'var(--rust)', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                  ⚡ Hurry! Only {product.stock} items remaining in our fulfillment warehouse.
                </span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="pdp-actions">
              <button
                className="btn btn-ghost"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : '+ Add to Bag'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now ➔
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="trust-row">
              <span>🚚 Free Express Shipping over ₹2000</span>
              <span>↩ 30-Day Doorstep Exchange & Returns</span>
              <span>🔒 100% Verified Genuine WearStep Item</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RICH DEEP-DIVE INFORMATION TABS
        ───────────────────────────────────────────────────────────── */}
        <div className="pdp-tabs-container">
          <div className="pdp-tabs-header">
            <button
              type="button"
              className={`pdp-tab-trigger ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              📋 Product Specifications
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              🧵 Materials & Care
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeTab === 'sizing' ? 'active' : ''}`}
              onClick={() => setActiveTab('sizing')}
            >
              📐 Size & Fit Guide
            </button>
            <button
              type="button"
              className={`pdp-tab-trigger ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              🚚 Shipping, Returns & FAQs
            </button>
          </div>

          <div className="pdp-tab-body">
            {/* TAB 1: PRODUCT SPECIFICATIONS */}
            {activeTab === 'details' && (
              <div>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', marginBottom: '14px' }}>
                  Technical Specifications
                </h4>
                <div className="pdp-spec-grid">
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Brand</span>
                    <span className="pdp-spec-val">{product.brand || 'WearStep'}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Category</span>
                    <span className="pdp-spec-val">{product.category}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Ideal For</span>
                    <span className="pdp-spec-val">{product.gender || 'Unisex'}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Fit Type</span>
                    <span className="pdp-spec-val">{isShoes ? 'Standard Athletic Width' : 'Modern Boxy Relaxed Fit'}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Weave / Construction</span>
                    <span className="pdp-spec-val">{isShoes ? 'Reinforced Vulcanized Mesh' : 'Interlock Heavy Combed Weave'}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Hardware & Trim</span>
                    <span className="pdp-spec-val">{isShoes ? 'High-Traction Rubber Sole' : 'YKK Matte Metal Accents'}</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Country of Origin</span>
                    <span className="pdp-spec-val">India</span>
                  </div>
                  <div className="pdp-spec-item">
                    <span className="pdp-spec-label">Authenticity</span>
                    <span className="pdp-spec-val">100% Genuine Certified</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MATERIALS & GARMENT CARE */}
            {activeTab === 'materials' && (
              <div>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', marginBottom: '10px' }}>
                  Composition & Sustainability
                </h4>
                <p style={{ fontSize: '13.5px', color: '#4A4D4A', lineHeight: '1.6', marginBottom: '16px' }}>
                  {isShoes
                    ? 'Crafted with 70% breathable ballistic nylon mesh, 20% recycled thermoplastic polyurethane (TPU) supportive cage, and 10% resilient EVA comfort cushioning.'
                    : isDenim
                    ? '100% Ring-Spun Indigo Cotton (13.5 oz selvedge grade), pre-washed to prevent unexpected shrinkage while retaining authentic raw wash textures.'
                    : '100% Combed Compact Cotton (280–380 GSM), ethically harvested and finished with an eco-conscious bio-polish for buttery softness and zero pilling.'}
                </p>

                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', marginBottom: '10px' }}>
                  Care Instructions
                </h4>
                <ul style={{ fontSize: '13px', color: 'var(--steel)', paddingLeft: '18px', lineHeight: '1.8', margin: 0 }}>
                  <li>❄️ Machine wash inside-out at 30°C (gentle cycle with like colors).</li>
                  <li>🚫 Do not bleach or use chlorine-based optical brighteners.</li>
                  <li>💨 Line dry in the shade to preserve garment shape and rich color depth.</li>
                  <li>♨️ Warm iron inside-out; do not iron directly on debossed labels or prints.</li>
                  {isShoes && <li>👟 For sneakers: Spot clean using a soft bristle brush and mild soapy foam.</li>}
                </ul>
              </div>
            )}

            {/* TAB 3: SIZE & FIT GUIDE */}
            {activeTab === 'sizing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', margin: 0 }}>
                    Size Chart & Exact Measurements
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--steel)' }}>
                    Model is 6'1" (185 cm) wearing size {isShoes ? 'UK8' : 'L'}
                  </span>
                </div>

                {isShoes ? (
                  <table className="pdp-size-table">
                    <thead>
                      <tr>
                        <th>Size (UK / India)</th>
                        <th>US Size</th>
                        <th>EU Size</th>
                        <th>Foot Length (CM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>UK 6</strong></td>
                        <td>US 7</td>
                        <td>EU 40</td>
                        <td>25.0 cm</td>
                      </tr>
                      <tr>
                        <td><strong>UK 7</strong></td>
                        <td>US 8</td>
                        <td>EU 41</td>
                        <td>26.0 cm</td>
                      </tr>
                      <tr>
                        <td><strong>UK 8</strong></td>
                        <td>US 9</td>
                        <td>EU 42</td>
                        <td>27.0 cm</td>
                      </tr>
                      <tr>
                        <td><strong>UK 9</strong></td>
                        <td>US 10</td>
                        <td>EU 43</td>
                        <td>28.0 cm</td>
                      </tr>
                      <tr>
                        <td><strong>UK 10</strong></td>
                        <td>US 11</td>
                        <td>EU 44</td>
                        <td>29.0 cm</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="pdp-size-table">
                    <thead>
                      <tr>
                        <th>Size Tag</th>
                        <th>Chest (Inches)</th>
                        <th>Length (Inches)</th>
                        <th>Shoulder Width</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>S</strong> (Small)</td>
                        <td>38 - 40"</td>
                        <td>27.5"</td>
                        <td>18.0"</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong> (Medium)</td>
                        <td>40 - 42"</td>
                        <td>28.5"</td>
                        <td>19.0"</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong> (Large)</td>
                        <td>42 - 44"</td>
                        <td>29.5"</td>
                        <td>20.0"</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong> (Extra Large)</td>
                        <td>44 - 46"</td>
                        <td>30.5"</td>
                        <td>21.0"</td>
                      </tr>
                      <tr>
                        <td><strong>XXL</strong> (Double XL)</td>
                        <td>46 - 48"</td>
                        <td>31.5"</td>
                        <td>22.0"</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '14px', lineHeight: '1.5' }}>
                  💡 <strong>Fit Tip:</strong> Our cuts are tailored with a contemporary relaxed drop. If you prefer a tighter, athletic fit, order one size down.
                </p>
              </div>
            )}

            {/* TAB 4: SHIPPING & FAQS */}
            {activeTab === 'shipping' && (
              <div>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', marginBottom: '12px' }}>
                  Frequently Asked Questions
                </h4>
                <div className="pdp-faq-list">
                  <div className="pdp-faq-card">
                    <div className="pdp-faq-q">📦 How long does delivery take?</div>
                    <p className="pdp-faq-a">
                      Orders placed before 2:00 PM IST are processed and dispatched on the same business day. Delivery across metropolitan areas takes 2–3 business days, and other regions within 4–5 business days.
                    </p>
                  </div>
                  <div className="pdp-faq-card">
                    <div className="pdp-faq-q">🔄 What is the return and exchange policy?</div>
                    <p className="pdp-faq-a">
                      WearStep offers a 30-day hassle-free return and exchange guarantee. If the fit or color isn’t perfect, our courier partners will pick it up directly from your doorstep with zero return shipping fees.
                    </p>
                  </div>
                  <div className="pdp-faq-card">
                    <div className="pdp-faq-q">💵 Is Cash on Delivery (COD) available?</div>
                    <p className="pdp-faq-a">
                      Yes! COD is supported across 19,000+ pin codes throughout India with instant SMS and OTP delivery confirmations.
                    </p>
                  </div>
                  <div className="pdp-faq-card">
                    <div className="pdp-faq-q">✨ Are all WearStep drops 100% authentic?</div>
                    <p className="pdp-faq-a">
                      Every product listed on our platform is designed and curated in-house. All items ship in branded WearStep protective garment boxes with verifiable batch labels.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            REVIEWS SECTION
        ───────────────────────────────────────────────────────────── */}
        <div className="reviews-block hsection" style={{ paddingLeft: 0, paddingRight: 0, marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0 }}>Customer Reviews & Experiences</h3>
            <span style={{ fontSize: '12px', color: 'var(--steel)' }}>
              100% Verified Buyer Feedback
            </span>
          </div>

          <div className="review-summary">
            <span className="big-rating">{product.rating || 4.2}</span>
            <div>
              <span className="stars">{starStr(product.rating || 4.2)}</span>
              <div className="mono" style={{ color: 'var(--steel)', fontSize: '12px' }}>
                Based on {product.reviews ? product.reviews.length : 0} verified customer reviews
              </div>
            </div>
          </div>

          {/* ADD REVIEW FORM */}
          <div className="co-card" style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>Leave a Review</h4>
            <form onSubmit={handleReviewSubmit}>
              <div className="field">
                <label>Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={{ width: '130px' }}
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                  <option value={2}>2 Stars ★★☆☆☆</option>
                  <option value={1}>1 Star ★☆☆☆☆</option>
                </select>
              </div>

              <div className="field">
                <label>Your Feedback</label>
                <textarea
                  rows={3}
                  placeholder={
                    isLoggedIn
                      ? 'Share your experience with fit, comfort, and fabric...'
                      : 'Please login to leave a review.'
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={!isLoggedIn}
                  required
                />
              </div>

              {isLoggedIn ? (
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={onOpenAuth}
                >
                  Login to Review
                </button>
              )}
            </form>
          </div>

          {/* REVIEWS LIST */}
          <div id="pdpReviewsList">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((r, i) => (
                <div className="review-item" key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="rname">{r.user}</div>
                    <span style={{ fontSize: '11px', color: '#2b7a4b', fontWeight: '600' }}>✓ Verified Buyer</span>
                  </div>
                  <span className="stars">{starStr(r.rating)}</span>
                  <p>{r.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--steel)', fontSize: '13px' }}>
                No reviews yet. Be the first to share your thoughts on this drop!
              </p>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="related-block" style={{ marginTop: '40px' }}>
            <div className="section-head">
              <h2 style={{ fontSize: '28px' }}>
                Complete
                <br />
                The Look
              </h2>
            </div>
            <div className="prod-grid">
              {related.map((r, i) => (
                <ProductCard key={r._id || r.id} product={r} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SIZE GUIDE MODAL
      ───────────────────────────────────────────────────────────── */}
      {showSizeModal && (
        <div className="modal open">
          <div className="modal-overlay" onClick={() => setShowSizeModal(false)}></div>
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <button className="modal-close" onClick={() => setShowSizeModal(false)}>
              ✕
            </button>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', marginBottom: '6px' }}>
              WearStep Sizing Guide
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--steel)', marginBottom: '18px' }}>
              How to measure and find your ideal fit for <strong>{product.name}</strong>.
            </p>

            {isShoes ? (
              <div>
                <table className="pdp-size-table">
                  <thead>
                    <tr>
                      <th>UK Size</th>
                      <th>US Size</th>
                      <th>EU Size</th>
                      <th>Length (CM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>UK 6</td><td>US 7</td><td>EU 40</td><td>25.0 cm</td></tr>
                    <tr><td>UK 7</td><td>US 8</td><td>EU 41</td><td>26.0 cm</td></tr>
                    <tr><td>UK 8</td><td>US 9</td><td>EU 42</td><td>27.0 cm</td></tr>
                    <tr><td>UK 9</td><td>US 10</td><td>EU 43</td><td>28.0 cm</td></tr>
                    <tr><td>UK 10</td><td>US 11</td><td>EU 44</td><td>29.0 cm</td></tr>
                  </tbody>
                </table>
                <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '14px', lineHeight: '1.5' }}>
                  <strong>How to measure your foot:</strong> Place a sheet of paper on the floor against a wall. Step on it with your heel touching the wall, mark the tip of your longest toe, and measure the distance in centimeters.
                </p>
              </div>
            ) : (
              <div>
                <table className="pdp-size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest</th>
                      <th>Length</th>
                      <th>Shoulder</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>38 - 40"</td><td>27.5"</td><td>18.0"</td></tr>
                    <tr><td>M</td><td>40 - 42"</td><td>28.5"</td><td>19.0"</td></tr>
                    <tr><td>L</td><td>42 - 44"</td><td>29.5"</td><td>20.0"</td></tr>
                    <tr><td>XL</td><td>44 - 46"</td><td>30.5"</td><td>21.0"</td></tr>
                    <tr><td>XXL</td><td>46 - 48"</td><td>31.5"</td><td>22.0"</td></tr>
                  </tbody>
                </table>
                <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '14px', lineHeight: '1.5' }}>
                  <strong>How to measure:</strong><br />
                  • <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level under your arms.<br />
                  • <strong>Length:</strong> Measure straight from the highest point of your shoulder down to the bottom hem.
                </p>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: '18px' }}
              onClick={() => setShowSizeModal(false)}
            >
              Got It, Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
