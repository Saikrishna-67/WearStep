import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLoginModal = ({ isOpen, onClose, onOpenCustomerModal }) => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span
            className="tag ext"
            style={{
              position: 'static',
              display: 'inline-flex',
              padding: '7px 14px',
              marginBottom: '12px',
            }}
          >
            🔒 Admin Access
          </span>
          <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Admin Login</h3>
          <p
            className="auth-hint"
            style={{ marginTop: 0, marginBottom: '18px' }}
          >
            Restricted to store administrators. Customer accounts cannot sign in here.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@wearstep.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-block"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>

          <p className="auth-hint" style={{ marginTop: '16px' }}>
            Demo admin: <code>admin@wearstep.com</code> / <code>admin123</code>
          </p>

          <p className="auth-hint">
            Shopping instead?{' '}
            <a
              onClick={() => {
                onClose();
                if (onOpenCustomerModal) onOpenCustomerModal();
              }}
              style={{
                color: 'var(--gold-deep)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Customer Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
