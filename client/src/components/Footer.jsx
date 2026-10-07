import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Footer = ({ onOpenAdminAuth }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      onOpenAdminAuth();
    }
  };

  return (
    <footer id="footer-contact">
      <div className="footer-top">
        <div>
          <div
            className="footer-logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}
          >
            <img
              src="/wearstep-logo-white-transparent.png"
              alt="WearStep"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <p>
            Clothing and footwear store. Designed and tested on real streets. Shipping across India.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop?category=Men's%20Clothing">Men's Clothing</Link>
          <Link to="/shop?category=Women's%20Clothing">Women's Clothing</Link>
          <Link to="/shop?category=Men's%20Shoes">Shoes</Link>
          <Link to="/shop?onSale=true">Offers / Sale</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/orders">Track Order</Link>
          <button onClick={() => alert('Returns & Exchanges: 30-day no-questions-asked doorstep pickup.')}>
            Returns & Exchanges
          </button>
          <button onClick={() => alert('Size Guide: True to standard Indian/UK sizing for shoes, regular boxy fit for apparel.')}>
            Size Guide
          </button>
          <button onClick={() => alert('FAQs: Free shipping over ₹2000. Cash on delivery available. Delivery within 3-5 business days.')}>
            FAQs
          </button>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#story">Our Story</a>
          <button onClick={() => alert('WearStep is expanding its design & engineering team in Bengaluru!')}>
            Careers
          </button>
          <button onClick={() => alert('Contact: support@wearstep.com | +91 98765 43210')}>
            Contact Us
          </button>
          <button
            id="adminLoginFooterLink"
            onClick={handleAdminClick}
            style={{
              color: 'var(--gold-deep)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Admin Login
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 WearStep. All rights reserved.</span>
        <span>Wear Your Style. Step Your Way.</span>
      </div>
    </footer>
  );
};
