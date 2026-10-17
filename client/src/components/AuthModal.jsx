import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

// Reusable SVG Icons for sleek, lightweight styling
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

const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const KeyIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
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

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.2-.01-.43 0-.61.02-.27.03-.5.15-.65.37-.36.52-.94 1.48-.94 2.88 0 1.64 1.15 3.25 1.34 3.5.19.25 2.24 3.47 5.51 4.77 2.37.94 3.32.84 3.92.73.8-.15 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.3-.21-.63-.37-.33-.16-1.95-.96-2.25-1.07-.3-.11-.52-.16-.74.16-.22.33-.86 1.07-1.05 1.29-.19.22-.38.25-.71.08-.33-.16-1.4-.52-2.67-1.65-.99-.88-1.65-1.96-1.84-2.29-.19-.33-.02-.51.14-.67.15-.15.33-.38.5-.57.17-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.02-2.44-.27-.64-.54-.55-.74-.56z"/>
  </svg>
);

export const AuthModal = ({ isOpen, onClose, onOpenAdminModal }) => {
  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);

  // Forms state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSpecialKey, setLoginSpecialKey] = useState('');
  const [showSpecialKeyInput, setShowSpecialKeyInput] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [regPassword, setRegPassword] = useState('');

  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotPin, setForgotPin] = useState('1234');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setLoginEmail('demo@wearstep.com');
    setLoginPassword('demo123');
    showToast('Demo credentials filled!');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password');
      return;
    }
    const cleaned = loginEmail.trim().toLowerCase().replace(/\.{2,}/g, '.');
    setLoading(true);
    try {
      const res = await login(cleaned, loginPassword, loginSpecialKey.trim());
      showToast(res.message || 'Logged in successfully');
      onClose();
    } catch (err) {
      if (err.data && err.data.isAdminAccount) {
        showToast('Admin account detected — opening Admin Login');
        onClose();
        if (onOpenAdminModal) onOpenAdminModal();
      } else if (err.data && err.data.isAccessDenied) {
        setShowSpecialKeyInput(true);
        showToast('Login access restricted by Admin. Enter your Special Key.');
      } else {
        showToast(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      showToast('Please fill in all fields');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    const cleaned = regEmail.trim().toLowerCase().replace(/\.{2,}/g, '.');
    setLoading(true);
    try {
      const res = await register(
        regName.trim(),
        cleaned,
        regPassword,
        regPhone.trim(),
        (regPin || '1234').trim()
      );
      showToast(res.message || 'Account created!');
      onClose();
    } catch (err) {
      showToast(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectReset = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier || !forgotNewPassword || !forgotConfirmPassword) {
      showToast('Please fill in all fields');
      return;
    }
    if (forgotNewPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const pinToSend = (forgotPin || '1234').trim();
      const res = await resetPassword(forgotIdentifier.trim(), pinToSend, forgotNewPassword);
      showToast(res.message || 'Password reset successful! You are now logged in.');
      onClose();
    } catch (err) {
      showToast(err.message || 'Reset failed. Check your email/phone and 4-digit PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal open" id="authModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-card">
        {/* Sleek circular close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img
            src="/wearstep-logo-transparent.png"
            alt="WearStep"
            style={{ width: '160px', height: 'auto', margin: '0 auto 8px', display: 'block' }}
          />

          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '700', margin: '6px 0 4px', color: 'var(--ink)' }}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--steel)', margin: 0 }}>
            {mode === 'login' && 'Sign in to access your orders, cart & wishlist.'}
            {mode === 'register' && 'Join the streetwear collective with exclusive drops.'}
            {mode === 'forgot' && 'Reset in seconds using your registered email or phone and 4-digit PIN.'}
          </p>
        </div>

        {/* Segmented Capsule Tabs (Login / Register) */}
        {mode !== 'forgot' && (
          <div className="auth-tabs-segmented">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            LOGIN FORM
        ───────────────────────────────────────────────────────────── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setForgotIdentifier(loginEmail);
                    setMode('forgot');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showLoginPwd ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowLoginPwd(!showLoginPwd)}
                  aria-label="Toggle password visibility"
                >
                  {showLoginPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Special Access Key Field (Visible if access denied or toggled) */}
            {showSpecialKeyInput ? (
              <div className="auth-field" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="auth-label" style={{ color: 'var(--rust)', fontWeight: '700' }}>
                    🔑 Admin Special Access Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSpecialKeyInput(false)}
                    style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--steel)', cursor: 'pointer' }}
                  >
                    Hide
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <KeyIcon />
                  </span>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. WS-482910"
                    value={loginSpecialKey}
                    onChange={(e) => setLoginSpecialKey(e.target.value.toUpperCase())}
                    autoFocus
                  />
                </div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--steel)', marginTop: '4px' }}>
                  💡 Enter your account&apos;s Special Key to unlock access granted by admin.
                </span>
              </div>
            ) : (
              <div style={{ textAlign: 'right', marginTop: '-6px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSpecialKeyInput(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    color: 'var(--steel)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Have an Admin Special Key?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In ➔'}
            </button>

            {/* Quick Demo Pill */}
            <div className="auth-demo-box">
              <div className="auth-demo-text">
                <strong>Try Demo Account</strong>
                <br />
                Instant access without typing
              </div>
              <button
                type="button"
                className="auth-demo-btn"
                onClick={handleFillDemo}
              >
                ⚡ 1-Click Fill
              </button>
            </div>

            {/* Admin Portal Switch */}
            <div className="auth-footer-nav">
              Are you a store manager?{' '}
              <button
                type="button"
                className="auth-footer-btn"
                onClick={() => {
                  onClose();
                  if (onOpenAdminModal) onOpenAdminModal();
                }}
              >
                Admin Portal 🔒
              </button>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────
            REGISTER FORM
        ───────────────────────────────────────────────────────────── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Your Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Phone / WhatsApp (Optional)</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <PhoneIcon />
                </span>
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-label">4-Digit Recovery PIN</label>
                <span style={{ fontSize: '11px', color: 'var(--rust)', fontWeight: '600' }}>
                  Default PIN: 1234
                </span>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <KeyIcon />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="auth-input"
                  placeholder="Choose 4-digit PIN (default 1234)"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  required
                />
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--steel)', marginTop: '4px' }}>
                💡 Remember this 4-digit PIN for instant password recovery anytime.
              </span>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showRegPwd ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowRegPwd(!showRegPwd)}
                  aria-label="Toggle password visibility"
                >
                  {showRegPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account ➔'}
            </button>

            <div className="auth-footer-nav">
              Already have an account?{' '}
              <button
                type="button"
                className="auth-footer-btn"
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────
            FORGOT PASSWORD: FAST 1-STEP RESET WITH PIN / PHONE & WHATSAPP
        ───────────────────────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <form onSubmit={handleDirectReset}>
            <div className="auth-field" style={{ marginTop: '4px' }}>
              <label className="auth-label">Registered Email or Phone</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="name@example.com or phone"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value.replace(/\.{2,}/g, '.'))}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-label">4-Digit Recovery PIN</label>
                <span style={{ fontSize: '11px', color: 'var(--rust)', fontWeight: '600' }}>
                  Default PIN: 1234
                </span>
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <KeyIcon />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="auth-input"
                  placeholder="Enter 4-digit PIN (default 1234)"
                  value={forgotPin}
                  onChange={(e) => setForgotPin(e.target.value)}
                  required
                />
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--steel)', marginTop: '4px' }}>
                💡 If you haven&apos;t set a custom PIN, use <strong>1234</strong> or your phone&apos;s last 4 digits.
              </span>
            </div>

            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showResetPwd ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Min 6 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowResetPwd(!showResetPwd)}
                  aria-label="Toggle password visibility"
                >
                  {showResetPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showResetPwd ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Re-enter new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Sign In ➔'}
            </button>

            {/* WhatsApp Instant Assistance Card */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                background: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.28)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0d7a46', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <WhatsAppIcon /> Need Direct WhatsApp Help?
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px' }}>
                  Message our team directly to reset or unlock your account instantly.
                </div>
              </div>
              <a
                href={`https://wa.me/919999999999?text=Hi%20WearStep,%20I%20need%20help%20resetting%20my%20password%20for%20account:%20${encodeURIComponent(forgotIdentifier || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '7px 12px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
                }}
              >
                WhatsApp ➔
              </a>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMode('login')}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
