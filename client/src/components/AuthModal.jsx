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

export const AuthModal = ({ isOpen, onClose, onOpenAdminModal }) => {
  const { login, register, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
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
  const [regPassword, setRegPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
        regPhone.trim()
      );
      showToast(res.message || 'Account created!');
      onClose();
    } catch (err) {
      showToast(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your email address');
      return;
    }
    const cleaned = forgotEmail.trim().toLowerCase().replace(/\.{2,}/g, '.');
    setForgotEmail(cleaned);
    setLoading(true);
    try {
      const res = await api.forgotPassword(cleaned);
      showToast(res.message || 'Verification code sent to your email!');
      if (res.devOtp) setDevOtp(res.devOtp);
      setResendCooldown(60);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('reset');
    } catch (err) {
      showToast(err.message || 'Could not find account with this email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !forgotEmail) return;
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      showToast('New verification code sent via Brevo!');
      if (res.devOtp) setDevOtp(res.devOtp);
      setResendCooldown(60);
    } catch (err) {
      showToast(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword || !confirmPassword) {
      showToast('Please fill in all fields');
      return;
    }
    if (otpCode.length !== 6) {
      showToast('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const cleaned = forgotEmail.trim().toLowerCase().replace(/\.{2,}/g, '.');
      const res = await resetPassword(cleaned, otpCode.trim(), newPassword);
      showToast(res.message || 'Password reset successful! You are now logged in.');
      onClose();
    } catch (err) {
      showToast(err.message || 'Invalid verification code or reset failed');
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
            {mode === 'reset' && 'Enter Verification Code'}
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--steel)', margin: 0 }}>
            {mode === 'login' && 'Sign in to access your orders, cart & wishlist.'}
            {mode === 'register' && 'Join the streetwear collective with exclusive drops.'}
            {mode === 'forgot' && 'Enter your registered email to receive a 6-digit code via Brevo.'}
            {mode === 'reset' && (
              <>
                Sent to: <strong style={{ color: 'var(--ink)' }}>{forgotEmail}</strong>
              </>
            )}
          </p>
        </div>

        {/* Segmented Capsule Tabs (Login / Register) */}
        {mode !== 'forgot' && mode !== 'reset' && (
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
                    setForgotEmail(loginEmail);
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
              <label className="auth-label">Phone (Optional)</label>
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
            STEP 1: REQUEST OTP (FORGOT PASSWORD)
        ───────────────────────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <div className="auth-field" style={{ marginTop: '6px' }}>
              <label className="auth-label">Registered Account Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value.replace(/\.{2,}/g, '.'))}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--steel)', marginTop: '6px' }}>
                We will email a 6-digit verification code to this address via Brevo.
              </span>
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code ➔'}
            </button>

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

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: ENTER OTP & NEW PASSWORD
        ───────────────────────────────────────────────────────────── */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            {/* INBOX / SPAM FOLDER ALERT */}
            <div
              style={{
                background: 'rgba(212, 166, 74, 0.12)',
                border: '1px solid rgba(212, 166, 74, 0.35)',
                borderRadius: '12px',
                padding: '12px 14px',
                margin: '4px 0 16px',
                fontSize: '12px',
                color: '#8A6218',
                lineHeight: '1.45',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📬</span> Check Inbox &amp; Spam / Junk Folder
              </div>
              <div>
                We emailed a 6-digit verification code to <strong>{forgotEmail}</strong>. If not in your primary inbox, please check your <strong>Spam / Junk</strong> folder.
              </div>
            </div>

            <div className="auth-field" style={{ marginTop: '6px' }}>
              <label className="auth-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="auth-otp-input"
                maxLength={6}
                placeholder="••••••"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                autoFocus
                required
              />
              <span style={{ display: 'block', textAlign: 'center', fontSize: '11px', color: 'var(--steel)', marginTop: '6px' }}>
                Enter the 6 digits sent to your email
              </span>
            </div>

            {/* Dev OTP fallback */}
            {devOtp && (
              <div
                style={{
                  background: 'rgba(25, 26, 24, 0.04)',
                  border: '1px dashed rgba(25, 26, 24, 0.25)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  textAlign: 'center',
                  color: 'var(--ink)',
                }}
              >
                <span>Didn&apos;t receive email? </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(devOtp);
                    showToast('Verification code auto-filled!');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--rust)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Click to auto-fill code ({devOtp})
                </button>
              </div>
            )}

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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Verifying & Updating...' : 'Set New Password & Sign In ➔'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                style={{ flex: 1 }}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMode('login')}
                style={{ flex: 1 }}
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
