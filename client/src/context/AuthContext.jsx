import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and check authenticated session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Unauthenticated session - clean state
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
