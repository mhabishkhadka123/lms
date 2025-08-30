import axios from 'axios';

// Create axios instance with base configuration
// Use EXPO_PUBLIC_API_URL if provided, else default to localhost
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Token will be set by AuthContext when user logs in
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      console.log('Authentication error, redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default api;
