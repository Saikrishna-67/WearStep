import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const Navbar = ({ onOpenAuth, onOpenWishlist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { totalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav id="nav">
      <div
        className="logo"
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
      >
        <img
          src="/wearstep-mark-transparent.png"
          alt="WearStep Mark"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
        />
        <span>
          WEAR<span style={{ color: 'var(--rust)' }}>STEP</span>
        </span>
      </div>

      <div className="nav-links" id="navLinks">
        <Link to="/" className={isCurrent('/') ? 'active' : ''}>
          Home
        </Link>
        <Link to="/shop" className={isCurrent('/shop') ? 'active' : ''}>
          Shop
        </Link>
        <Link to="/orders" className={isCurrent('/orders') ? 'active' : ''}>
          My Orders
        </Link>
        {isLoggedIn && !isAdmin && (
          <Link to="/profile" className={isCurrent('/profile') ? 'active' : ''}>
            Profile
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className={isCurrent('/admin') ? 'active' : ''}>
            Admin
          </Link>
        )}
        {isLoggedIn && (
          <button
            onClick={() => {
              logout();
              showToast('Logged out successfully');
              navigate('/');
            }}
            style={{ color: 'var(--rust)', marginLeft: '4px' }}
          >
            Logout
          </button>
        )}
      </div>

      <div className="search-wrap">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            id="searchInput"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="nav-actions">
        <button
          className="icon-btn"
          id="wishBtn"
          onClick={onOpenWishlist}
          title="Wishlist"
        >
          ♥
          <span
            className={`count-badge ${wishlistCount > 0 ? 'show' : ''}`}
            id="wishCount"
          >
            {wishlistCount}
          </span>
        </button>

        <button
          className="icon-btn"
          onClick={() => navigate('/cart')}
          title="Cart"
        >
          Cart
          <span
            className={`count-badge ${totalCount > 0 ? 'show' : ''}`}
            id="cartCount"
          >
            {totalCount}
          </span>
        </button>

        {isLoggedIn ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className="icon-btn logged-in"
              id="authBtn"
              onClick={() => navigate(isAdmin ? '/admin' : '/profile')}
              title={isAdmin ? 'Go to Admin Dashboard' : 'Go to Profile'}
            >
              Hi, {user.name.split(' ')[0]}
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                logout();
                showToast('Logged out successfully');
                navigate('/');
              }}
              title="Logout"
              style={{
                borderColor: 'var(--rust)',
                color: 'var(--rust)',
                background: 'transparent',
              }}
            >
              Logout ⏻
            </button>
          </div>
        ) : (
          <button
            className="icon-btn"
            id="authBtn"
            onClick={onOpenAuth}
          >
            Login
          </button>
        )}
      </div>

      <button
        className="menu-toggle"
        id="menuToggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        Menu
      </button>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--concrete)',
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 4vw',
            borderBottom: '1px solid rgba(25, 26, 24, 0.1)',
            alignItems: 'flex-start',
            gap: '16px',
            zIndex: 99,
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
          {isLoggedIn && !isAdmin && (
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
          )}
          {!isLoggedIn ? (
            <button
              className="btn btn-primary btn-sm btn-block"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
            >
              Login
            </button>
          ) : (
            <button
              className="btn btn-danger btn-sm btn-block"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
