import axios from 'axios';

const API_BASE_URL ='https://lms-backend-czla.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Network timeout or connection error
      console.error('Network error:', error.message);
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    } else if (!error.response) {
      // No response received (server not running or network issue)
      console.error('No response from server:', error.message);
      throw new Error('Server is not responding. Please make sure the backend server is running on port 5000.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
};

// Books API
export const booksAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
};

// Borrowings API
export const borrowingsAPI = {
  borrow: (bookId) => api.post('/borrow', { bookId }),
  return: (bookId) => api.post('/return', { bookId }),
  getUserBorrowings: () => api.get('/borrowings'),
  getAllBorrowings: () => api.get('/all-borrowings'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard-stats'),
};

export default api;
