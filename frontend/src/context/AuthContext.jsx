import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    accessToken: null,
  });
  const [loading, setLoading] = useState(true);

  // Silent refresh handler: Fetches a new access token using the HTTP-Only refresh cookie
  const refresh = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
      const { accessToken, user } = response.data.data;
      setAuth({ user, accessToken });
      return accessToken;
    } catch (error) {
      // Clear local auth state if refresh fails (e.g. cookie expired)
      setAuth({ user: null, accessToken: null });
      throw error;
    }
  }, []);

  // Check auth session status on app boot
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refresh();
      } catch (err) {
        // Ignored, user is just unauthenticated on boot
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, [refresh]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      setAuth({ user, accessToken });
      return user;
    } catch (error) {
      throw error?.response?.data?.message || 'Login failed';
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data.data.user;
    } catch (error) {
      throw error?.response?.data?.details || error?.response?.data?.message || 'Registration failed';
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error on server', error);
    } finally {
      // Always clear local state even if server fails to clear cookie
      setAuth({ user: null, accessToken: null });
    }
  };

  const value = {
    auth,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export useAuth hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
