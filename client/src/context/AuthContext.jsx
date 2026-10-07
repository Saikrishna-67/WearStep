import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wearstep_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('wearstep_token');
      if (storedToken) {
        try {
          const res = await api.getMe(storedToken);
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session check failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin(email, password);
    if (res.success && res.token) {
      localStorage.setItem('wearstep_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const updateProfile = async (name) => {
    const res = await api.updateProfile(name);
    if (res.success && res.user) {
      setUser((prev) => ({ ...prev, name: res.user.name }));
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('wearstep_token');
    setToken(null);
    setUser(null);
  };

  const refreshUserData = async () => {
    if (token) {
      try {
        const res = await api.getMe(token);
        if (res.success && res.user) {
          setUser(res.user);
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
