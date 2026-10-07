import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const id = product._id || product.id;
  const wishlisted = isWishlisted(id);

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const starStr = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  const disc =
    product.discount ||
    (product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0);

  const handleWishClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product).then((added) => {
      showToast(added ? `Added "${product.name}" to wishlist` : `Removed from wishlist`);
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      className="prod-card"
      onClick={handleCardClick}
      style={{ animationDelay: `${(index % 9) * 0.04}s` }}
      role="button"
      tabIndex={0}
    >
      <div className="prod-img-wrap">
        {product.stock === 0 ? (
          <span className="tag rust">Out of Stock</span>
        ) : product.stock <= 5 ? (
          <span className="tag rust">Low Stock ({product.stock})</span>
        ) : product.newArrival ? (
          <span className="tag">New</span>
        ) : disc > 0 ? (
          <span className="tag rust">-{disc}%</span>
        ) : null}

        <button
          className={`wish-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishClick}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80'}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className="prod-info">
        <span className="mono" style={{ color: 'var(--steel)' }}>
          {product.category}
        </span>

        <div className="rating-row">
          <span className="stars">{starStr(product.rating || 4.2)}</span>
          <span>
            {product.rating || 4.2} ({product.ratingCount || 0})
          </span>
        </div>

        <h3>{product.name}</h3>

        <div className="price-row">
          <span className="price">{fmt(product.price)}</span>
          {product.mrp > product.price && (
            <>
              <span className="mrp">{fmt(product.mrp)}</span>
              <span className="disc">{disc}% off</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
