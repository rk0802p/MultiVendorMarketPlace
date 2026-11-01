import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api.js';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    itemCount: 0,
    hasUnavailableItems: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartService.getCart();
      if (res && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartService.addItem(productId, quantity);
      if (res && res.data) {
        setCart(res.data);
      }
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add item to cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartService.updateQuantity(productId, quantity);
      if (res && res.data) {
        setCart(res.data);
      }
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update item quantity';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await cartService.removeItem(productId);
      if (res && res.data) {
        setCart(res.data);
      }
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove item';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await cartService.clearCart();
      setCart({
        items: [],
        subtotal: 0,
        itemCount: 0,
        hasUnavailableItems: false,
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to clear cart';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount || 0,
        subtotal: cart.subtotal || 0,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
