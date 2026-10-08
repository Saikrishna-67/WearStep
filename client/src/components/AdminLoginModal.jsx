import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export const AdminLoginModal = ({ isOpen, onClose, onOpenCustomerModal }) => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFillAdminDemo = () => {
    setEmail('admin@wearstep.com');
    setPassword('admin123');
    showToast('Admin demo credentials filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter admin credentials');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      showToast(res.message || 'Admin session started');
      onClose();
      navigate('/admin');
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal open" id="adminAuthModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-card admin-modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(212, 166, 74, 0.15)',
              border: '1px solid rgba(212, 166, 74, 0.4)',
              borderRadius: '100px',
              color: '#D4A64A',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            🔒 Restricted Access
          </div>

          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '700', color: '#F4F2EC', margin: '0 0 6px' }}>
            Store Manager Portal
          </h3>

          <p style={{ fontSize: '13px', color: '#A0A5A2', margin: 0 }}>
            Restricted to WearStep administrators & stock controllers.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" style={{ color: '#E2DFD8' }}>Admin Email</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" style={{ color: '#D4A64A' }}>
                <MailIcon />
              </span>
              <input
                type="email"
                className="auth-input"
                placeholder="admin@wearstep.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" style={{ color: '#E2DFD8' }}>Security Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon" style={{ color: '#D4A64A' }}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn-submit"
            style={{
              background: 'linear-gradient(135deg, #D4A64A 0%, #B8892E 100%)',
              color: '#141513',
              boxShadow: '0 8px 24px rgba(212, 166, 74, 0.35)',
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard ➔'}
          </button>

          {/* Quick Demo Pill */}
          <div
            className="auth-demo-box"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(212, 166, 74, 0.3)',
            }}
          >
            <div className="auth-demo-text" style={{ color: '#B5BAA8' }}>
              <strong style={{ color: '#F4CD6A' }}>Demo Admin Login</strong>
              <br />
              Pre-fill official admin account
            </div>
            <button
              type="button"
              className="auth-demo-btn"
              style={{
                background: 'rgba(212, 166, 74, 0.2)',
                color: '#F4CD6A',
                borderColor: 'rgba(212, 166, 74, 0.4)',
              }}
              onClick={handleFillAdminDemo}
            >
              ⚡ 1-Click Fill
            </button>
          </div>

          <div className="auth-footer-nav" style={{ marginTop: '18px' }}>
            Looking for regular shopping?{' '}
            <button
              type="button"
              className="auth-footer-btn"
              style={{ color: '#D4A64A' }}
              onClick={() => {
                onClose();
                if (onOpenCustomerModal) onOpenCustomerModal();
              }}
            >
              Customer Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
