import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const Cart = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { cart, validatedData, updateQty, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const lines = validatedData.lines || [];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCode, validatedData.subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        showToast(res.message || 'Coupon applied!');
      }
    } catch (err) {
      showToast(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, validatedData.total - discountAmount);

  if (lines.length === 0) {
    return (
      <div id="view-cart">
        <div className="cart-wrap">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '28px' }}>
            Your Cart
          </h2>
          <div className="empty-state">
            <div className="emoji">🛍️</div>
            <p>Your cart is empty. Go find something you like.</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="view-cart">
      <div className="cart-wrap">
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '28px' }}>
          Your Cart ({lines.length})
        </h2>

        <div className="cart-layout">
          {/* CART ITEMS LIST */}
          <div>
            {lines.map((l) => {
              const key = `${l.id}|${l.size}|${l.color}`;
              return (
                <div className="cart-line" key={key}>
                  <img src={l.image} alt={l.name} />

                  <div className="cart-line-info">
                    <h4>{l.name}</h4>
                    <div className="cart-line-meta">
                      Size: {l.size} · Color: {l.color}
                    </div>

                    <div className="cart-line-bottom">
                      <div className="qty-stepper">
                        <button
                          type="button"
                          onClick={() => updateQty(key, -1)}
                        >
                          −
                        </button>
                        <span>{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(key, 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="price">{fmt(l.lineTotal)}</span>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          removeFromCart(key);
                          showToast('Removed from cart');
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    {l.isLowStock && (
                      <span style={{ fontSize: '11px', color: 'var(--rust)', marginTop: '4px', display: 'block' }}>
                        Low Stock ({l.stock} left)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="summary-panel">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{fmt(validatedData.subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {validatedData.shipping === 0 ? 'Free' : fmt(validatedData.shipping)}
              </span>
            </div>

            {appliedCoupon && (
              <div className="summary-row" style={{ color: 'var(--green)' }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{fmt(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>{fmt(finalTotal)}</span>
            </div>

            {/* COUPON INPUT */}
            <form onSubmit={handleApplyCoupon} style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    border: '1.5px solid rgba(25, 26, 24, 0.2)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    background: 'var(--concrete)',
                    flex: 1,
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-ghost btn-sm"
                  disabled={validatingCoupon}
                >
                  Apply
                </button>
              </div>
              <span className="auth-hint" style={{ display: 'block', marginTop: '6px' }}>
                Try: <code>WELCOME20</code>, <code>WEARSTEP10</code>, <code>FASHION500</code>
              </span>
            </form>

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: '20px' }}
              onClick={() => {
                navigate('/checkout', {
                  state: { couponCode: appliedCoupon ? appliedCoupon.code : null },
                });
              }}
            >
              Proceed to Checkout
            </button>

            {!isLoggedIn && (
              <p
                className="auth-hint"
                style={{ textAlign: 'center', marginTop: '10px' }}
              >
                You will need to{' '}
                <a
                  onClick={onOpenAuth}
                  style={{
                    color: 'var(--gold-deep)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  login
                </a>{' '}
                to place an order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
