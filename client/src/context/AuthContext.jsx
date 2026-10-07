import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('wearstep_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wearstep_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('wearstep_user'));

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('wearstep_token');
      if (storedToken) {
        try {
          const res = await api.getMe(storedToken);
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('wearstep_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session check failed:', err);
          logout();
        }
      } else {
        setUser(null);
        localStorage.removeItem('wearstep_user');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      localStorage.setItem('wearstep_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      localStorage.setItem('wearstep_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin(email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      localStorage.setItem('wearstep_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const updateProfile = async (name) => {
    const res = await api.updateProfile(name);
    if (res.success && res.user) {
      const updated = { ...user, name: res.user.name };
      setUser(updated);
      localStorage.setItem('wearstep_user', JSON.stringify(updated));
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('wearstep_token');
    localStorage.removeItem('wearstep_user');
    setToken(null);
    setUser(null);
  };

  const refreshUserData = async () => {
    if (token) {
      try {
        const res = await api.getMe(token);
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('wearstep_user', JSON.stringify(res.user));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        adminLogin,
        logout,
        updateProfile,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
