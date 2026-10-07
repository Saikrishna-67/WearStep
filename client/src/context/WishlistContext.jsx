import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isLoggedIn, token } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wearstep_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wearstep_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch backend wishlist when user logs in
  useEffect(() => {
    const fetchBackendWishlist = async () => {
      if (isLoggedIn && token) {
        try {
          const res = await api.getWishlist();
          if (res.success && Array.isArray(res.wishlist)) {
            setWishlist(res.wishlist);
          }
        } catch (err) {
          console.error('Error fetching backend wishlist:', err);
        }
      }
    };
    fetchBackendWishlist();
  }, [isLoggedIn, token]);

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const exists = wishlist.some((item) => (item._id || item.id) === productId);

    let nextWishlist;
    if (exists) {
      nextWishlist = wishlist.filter((item) => (item._id || item.id) !== productId);
    } else {
      nextWishlist = [...wishlist, product];
    }
    setWishlist(nextWishlist);

    // If logged in, sync with server
    if (isLoggedIn) {
      try {
        await api.toggleWishlist(productId);
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }
    }

    return !exists;
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
