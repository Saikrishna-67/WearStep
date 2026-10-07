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
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span className="mono" style={{ color: 'var(--steel)' }}>
          Loading product...
        </span>
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

  const disc =
    product.discount ||
    (product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    showToast(`Added ${quantity} × "${product.name}" to cart`);
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
                    <img src={im} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS & OPTIONS */}
          <div>
            <span className="mono pdp-cat">{product.category}</span>
            <h1 className="pdp-title">{product.name}</h1>

            <div className="rating-row">
              <span className="stars">{starStr(product.rating || 4.2)}</span>
              <span>
                {product.rating || 4.2} · {product.ratingCount || 0} ratings
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
            </div>

            <p className="pdp-desc">{product.description}</p>

            {/* SIZES */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="opt-group">
                <span className="opt-label">Select Size</span>
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
                <span className="opt-label">Color: {selectedColor}</span>
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
                >
                  +
                </button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--rust)', marginTop: '4px', display: 'block' }}>
                  Only {product.stock} items left in stock!
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
                {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="trust-row">
              <span>🚚 Free delivery over ₹2000</span>
              <span>↩ 30-day returns</span>
              <span>🔒 100% Secure checkout</span>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="reviews-block hsection" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <h3>Customer Reviews</h3>

          <div className="review-summary">
            <span className="big-rating">{product.rating || 4.2}</span>
            <div>
              <span className="stars">{starStr(product.rating || 4.2)}</span>
              <div className="mono" style={{ color: 'var(--steel)' }}>
                Based on {product.reviews ? product.reviews.length : 0} reviews
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
                  style={{ width: '120px' }}
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
                  <div className="rname">{r.user}</div>
                  <span className="stars">{starStr(r.rating)}</span>
                  <p>{r.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--steel)', fontSize: '13px' }}>
                No reviews yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="related-block">
            <div className="section-head">
              <h2 style={{ fontSize: '28px' }}>
                You May
                <br />
                Also Like
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
    </div>
  );
};
