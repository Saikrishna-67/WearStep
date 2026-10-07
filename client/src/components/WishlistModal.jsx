import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const WishlistModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  const handleMoveToCart = (product) => {
    const size = product.sizes ? product.sizes[0] : 'Standard';
    const color = product.colors ? product.colors[0].name : 'Default';
    addToCart(product, size, color, 1);
    toggleWishlist(product);
    showToast(`Moved "${product.name}" to cart`);
  };

  const handleView = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  return (
    <div className="modal open" id="wishModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-card" style={{ width: 'min(480px, 100%)' }}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h3 style={{ marginBottom: '18px' }}>
          Your Wishlist ({wishlist.length})
        </h3>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">♡</div>
            <p>Nothing saved yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                navigate('/shop');
              }}
            >
              Explore Shop
            </button>
          </div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {wishlist.map((p) => {
              const id = p._id || p.id;
              return (
                <div className="cart-line" key={id}>
                  <img
                    src={p.images && p.images[0] ? p.images[0] : ''}
                    alt={p.name}
                  />
                  <div className="cart-line-info">
                    <h4>{p.name}</h4>
                    <span className="price">{fmt(p.price)}</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMoveToCart(p)}
                      >
                        Move to Cart
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleView(id)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => toggleWishlist(p)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
