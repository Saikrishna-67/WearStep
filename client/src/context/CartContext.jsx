import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('wearstep_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [validatedData, setValidatedData] = useState({
    lines: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
  });

  useEffect(() => {
    localStorage.setItem('wearstep_cart', JSON.stringify(cart));
    validateCartItems();
  }, [cart]);

  const validateCartItems = async () => {
    const items = Object.values(cart);
    if (items.length === 0) {
      setValidatedData({ lines: [], subtotal: 0, shipping: 0, total: 0 });
      return;
    }

    try {
      const res = await api.validateCart(items);
      if (res.success) {
        setValidatedData({
          lines: res.lines,
          subtotal: res.subtotal,
          shipping: res.shipping,
          total: res.total,
        });
      }
    } catch (e) {
      console.error('Cart validation error:', e);
    }
  };

  const cartKey = (id, size, color) => `${id}|${size}|${color}`;

  const addToCart = (product, size, color, qty = 1) => {
    const key = cartKey(product._id || product.id, size, color);
    setCart((prev) => {
      const existing = prev[key];
      const newQty = existing ? existing.qty + qty : qty;
      return {
        ...prev,
        [key]: {
          id: product._id || product.id,
          name: product.name,
          image: product.images ? product.images[0] : '',
          price: product.price,
          mrp: product.mrp,
          size,
          color,
          qty: newQty,
        },
      };
    });
  };

  const updateQty = (key, delta) => {
    setCart((prev) => {
      const item = prev[key];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: { ...item, qty: newQty },
      };
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('wearstep_cart');
  };

  const totalCount = Object.values(cart).reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        validatedData,
        totalCount,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refreshCart: validateCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
