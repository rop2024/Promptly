import axios from 'axios';

// Use environment variable or fallback to localhost for development
// Note: Services add /auth, /entries etc, so baseURL should end with /api
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API configured with base URL:', API_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('promptly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('promptly_token');
      localStorage.removeItem('promptly_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;