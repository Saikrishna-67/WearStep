import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onOpenAdminModal }) => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);

  // Forms state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      showToast(res.message || 'Logged in successfully');
      onClose();
    } catch (err) {
      if (err.data && err.data.isAdminAccount) {
        showToast('Admin account detected — opening Admin Login');
        onClose();
        if (onOpenAdminModal) onOpenAdminModal();
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
    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword);
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
    if (!forgotEmail || !newPassword || !confirmPassword) {
      showToast('Please fill in all fields');
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
      const res = await api.resetPassword(forgotEmail, newPassword);
      showToast(res.message || 'Password updated successfully! Please log in.');
      setMode('login');
      setLoginEmail(forgotEmail);
      setLoginPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal open" id="authModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/wearstep-logo-transparent.png"
            alt="WearStep Fashion & Footwear"
            style={{ width: '190px', maxWidth: '70%', height: 'auto', margin: '0 auto 6px', display: 'block' }}
          />
          <span className="mono" style={{ color: 'var(--steel)', fontSize: '10px' }}>
            Wear Your Style. Step Your Way.
          </span>
        </div>

        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setMode('forgot');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold-deep)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="auth-hint">
              Demo account: <code>demo@wearstep.com</code> / <code>demo123</code>
              <br />
              Admin account?{' '}
              <a
                onClick={() => {
                  onClose();
                  if (onOpenAdminModal) onOpenAdminModal();
                }}
                style={{ color: 'var(--gold-deep)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Admin Login Portal
              </a>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* DIRECT RESET PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Reset Password</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--steel)', marginBottom: '18px' }}>
              Enter your registered email and your new password.
            </p>

            <div className="field">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password →'}
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
      </div>
    </div>
  );
};
