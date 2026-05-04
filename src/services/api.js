import axios from 'axios';

/**
 * Centralized Axios instance for all API calls
 * Uses VITE_API_URL environment variable which is:
 * - Development: http://localhost:3000/api (from .env)
 * - Production: https://api.yourdomain.com/api (from .env.production)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Request Interceptor
 * Add authentication tokens or other headers if needed
 */
api.interceptors.request.use(
  (config) => {
    // Add auth token to headers if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common errors and response transformations
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      console.error('Unauthorized - redirecting to login');
      // You can dispatch a logout action or redirect here
      localStorage.removeItem('authToken');
    } else if (error.response?.status === 403) {
      console.error('Forbidden - insufficient permissions');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error - please try again later');
    }
    return Promise.reject(error);
  }
);

export default api;