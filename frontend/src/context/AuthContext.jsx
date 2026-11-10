import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse cached user:', err);
    localStorage.removeItem('user');
    return null;
  }
};

const getInitialToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getInitialToken();
      const storedUser = getInitialUser();

      if (storedToken && storedUser) {
        try {
          setUser(storedUser);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      } else if (storedToken || storedUser) {
        // Inconsistent state: clear both
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data?.message || 'Registration failed.');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updatedData };
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed saving user to localStorage:', e);
      }
      return next;
    });
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
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

export default AuthContext;
