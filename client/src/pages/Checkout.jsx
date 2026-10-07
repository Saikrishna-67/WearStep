import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LiquidGoldEmblem } from '../components/LiquidGoldEmblem';
import { api } from '../services/api';

export const Checkout = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, validatedData, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review, 4: Success
  const [loading, setLoading] = useState(false);

  // Address
  const [fullName, setFullName] = useState(user ? user.name : '');
  const [address, setAddress] = useState('42 MG Road, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [phone, setPhone] = useState('9876543210');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Coupon from cart navigation state
  const [couponCode, setCouponCode] = useState(location.state?.couponCode || '');
  const [placedOrderId, setPlacedOrderId] = useState('');

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const lines = validatedData.lines || [];

  useEffect(() => {
    if (!isLoggedIn) {
      showToast('Please login to continue checkout');
      navigate('/cart');
      onOpenAuth();
    } else if (user) {
      if (!fullName) setFullName(user.name);
    }
  }, [isLoggedIn, user]);

  if (lines.length === 0 && step !== 4) {
    return (
      <div id="view-checkout">
        <div className="checkout-wrap">
          <div className="empty-state">
            <div className="emoji">🛍️</div>
            <p>Your cart is empty. Add products before proceeding to checkout.</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleToPayment = (e) => {
    e.preventDefault();
    if (!fullName || !address || !city || !pincode || !phone) {
      showToast('Please fill in all delivery details');
      return;
    }
    setStep(2);
  };

  const handleToReview = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        items: lines.map((l) => ({
          product: l.id,
          name: l.name,
          image: l.image,
          size: l.size,
          color: l.color,
          price: l.price,
          quantity: l.qty,
        })),
        shippingAddress: {
          fullName,
          address,
          city,
          pincode,
          phone,
        },
        paymentMethod,
        couponCode: couponCode || null,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setPlacedOrderId(res.order.orderId);
        clearCart();
        setStep(4);
        showToast('Order placed successfully!');

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#FFD700', '#C1440E', '#191A18'],
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      showToast(err.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryPanel = () => (
    <div className="summary-panel">
      <h3>Order Summary</h3>
      {lines.map((l) => (
        <div className="summary-row" key={`${l.id}|${l.size}|${l.color}`}>
          <span>
            {l.name} × {l.qty}
          </span>
          <span>{fmt(l.lineTotal)}</span>
        </div>
      ))}
      <div className="summary-row">
        <span>Shipping</span>
        <span>{validatedData.shipping === 0 ? 'Free' : fmt(validatedData.shipping)}</span>
      </div>
      <div className="summary-row total">
        <span>Total</span>
        <span>{fmt(validatedData.total)}</span>
      </div>
    </div>
  );

  return (
    <div id="view-checkout">
      <div className="checkout-wrap">
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', marginBottom: '10px' }}>
          Checkout
        </h2>

        {step < 4 && (
          <div className="checkout-steps">
            <div className={`dot2 ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`dot2 ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`dot2 ${step >= 3 ? 'active' : ''}`}></div>
          </div>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 1 && (
          <div className="checkout-layout">
            <div className="co-card">
              <h3>1. Delivery Details</h3>
              <form onSubmit={handleToPayment}>
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Street Address</label>
                  <input
                    type="text"
                    placeholder="House / Flat no, Street, Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      placeholder="560038"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Continue to Payment →
                </button>
              </form>
            </div>
            {renderSummaryPanel()}
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <div className="checkout-layout">
            <div className="co-card">
              <h3>2. Payment Method</h3>
              <form onSubmit={handleToReview}>
                <div className="pay-options">
                  <label
                    className={`pay-opt ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                    />
                    UPI (Google Pay / PhonePe / Paytm / BHIM)
                  </label>

                  <label
                    className={`pay-opt ${paymentMethod === 'card' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    Credit / Debit Card (Visa, MasterCard, RuPay)
                  </label>

                  <label
                    className={`pay-opt ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    Cash on Delivery (Pay at your doorstep)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Review Order →
                  </button>
                </div>
              </form>
            </div>
            {renderSummaryPanel()}
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="checkout-layout">
            <div className="co-card">
              <h3>3. Confirm Order</h3>
              <div className="order-review">
                {lines.map((l) => (
                  <div className="row" key={`${l.id}|${l.size}|${l.color}`}>
                    <span>
                      {l.name} ({l.size}, {l.color}) × {l.qty}
                    </span>
                    <span>{fmt(l.lineTotal)}</span>
                  </div>
                ))}
                <div className="row">
                  <span>Shipping</span>
                  <span>
                    {validatedData.shipping === 0 ? 'Free' : fmt(validatedData.shipping)}
                  </span>
                </div>
                <div className="row">
                  <span>Payment Mode</span>
                  <span style={{ textTransform: 'uppercase' }}>{paymentMethod}</span>
                </div>
                <div className="row">
                  <span>Deliver To</span>
                  <span>
                    {fullName}, {city} ({pincode})
                  </span>
                </div>
                <div className="row total">
                  <span>Total Payable</span>
                  <span>{fmt(validatedData.total)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
            {renderSummaryPanel()}
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 4 && (
          <div className="success-view">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <LiquidGoldEmblem size={96} />
            </div>
            <div className="success-check">
              <svg viewBox="0 0 24 24">
                <path d="M4 12l5 5L20 6" />
              </svg>
            </div>
            <h3 style={{ fontSize: '26px', marginBottom: '10px' }}>Order Placed!</h3>
            <p style={{ color: 'var(--steel)' }}>
              Thank you for stepping with us. You will receive an SMS and email confirmation with your real-time tracking link.
            </p>
            <div className="order-id-box" id="orderIdDisplay">
              Order ID: {placedOrderId}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={() => navigate('/shop')}>
                Continue Shopping
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                View My Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
