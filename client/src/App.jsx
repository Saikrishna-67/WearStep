import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WishlistModal } from './components/WishlistModal';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

export const App = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <>
      {/* Background decoration matching prototype */}
      <div className="bg-field">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="grain"></div>

      {/* Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Main Views */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/product/:id"
            element={<ProductDetail onOpenAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/cart"
            element={<Cart onOpenAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/checkout"
            element={<Checkout onOpenAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/orders"
            element={<MyOrders onOpenAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/profile"
            element={
              <Profile
                onOpenWishlist={() => setIsWishlistOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onOpenAdminAuth={() => setIsAdminAuthOpen(true)} />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenAdminModal={() => setIsAdminAuthOpen(true)}
      />

      <AdminLoginModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onOpenCustomerModal={() => setIsAuthOpen(true)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </>
  );
};
