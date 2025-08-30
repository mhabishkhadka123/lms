import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    checkStoredToken();
  }, []);

  const checkStoredToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with server
        const response = await api.get('/books');
        if (response.status === 200) {
          // Token is valid, get user info from stored data
          const userData = await SecureStore.getItemAsync('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          // Token is invalid, clear stored data
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      const { token, user: userData } = response.data;

      // Store token and user data
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');

      // Clear API headers
      delete api.defaults.headers.common['Authorization'];

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
