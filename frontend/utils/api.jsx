import axios from 'axios';
import config from './config';

const API_BASE_URL = config.apiBaseUrl;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.apiTimeout,
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
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

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service
const apiService = {
  
  // ==========================================
  // PUBLIC ENDPOINTS (No authentication)
  // ==========================================
  
  // Submit document request
  submitRequest: async (requestData) => {
    try {
      const response = await apiClient.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get request status
  getRequestStatus: async (requestId) => {
    try {
      const response = await apiClient.get(`/requests/${requestId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==========================================
  // PROTECTED ENDPOINTS (Require authentication)
  // ==========================================

  // Get all requests
  getAllRequests: async (status) => {
    try {
      const url = status ? `/requests?status=${status}` : '/requests';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update request status
  updateRequestStatus: async (requestId, statusData) => {
    try {
      const response = await apiClient.patch(`/requests/${requestId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cleanup expired requests
  cleanupRequests: async () => {
    try {
      const response = await apiClient.delete('/requests/cleanup');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default apiService;