import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const Profile = ({ onOpenWishlist, onOpenAuth }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const { wishlistCount } = useWishlist();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      showToast('Please login to view your profile');
      navigate('/');
      onOpenAuth();
    } else if (user) {
      setName(user.name);
    }
  }, [isLoggedIn, user]);

  const initials = (str) => {
    if (!str) return 'WS';
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(name);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  if (!user) return null;

  return (
    <div id="view-profile">
      <div className="profile-wrap">
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '28px' }}>
          My Profile
        </h2>

        <div className="profile-layout">
          {/* PROFILE CARD */}
          <div className="co-card profile-card">
            <div className="profile-avatar">{initials(user.name)}</div>

            <form onSubmit={handleSave} style={{ width: '100%' }}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Registered Email</label>
                <input type="email" value={user.email} disabled />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    logout();
                    showToast('Logged out');
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            </form>
          </div>

          {/* STATS & QUICK LINKS */}
          <div>
            <div className="stat-grid profile-stat-grid">
              <div className="stat-card">
                <span className="mono">Total Orders</span>
                <div className="stat-num">{user.stats?.orderCount || 0}</div>
              </div>

              <div className="stat-card">
                <span className="mono">Wishlist Items</span>
                <div className="stat-num">{wishlistCount}</div>
              </div>

              <div className="stat-card">
                <span className="mono">Total Spent</span>
                <div className="stat-num">
                  {fmt(user.stats?.totalSpent || 0)}
                </div>
              </div>
            </div>

            <div className="co-card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
                Quick Links
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/orders')}
                >
                  View Orders →
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onOpenWishlist}
                >
                  View Wishlist →
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
