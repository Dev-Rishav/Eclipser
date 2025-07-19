// src/config/axiosConfig.js
import axios from 'axios';
import { API_CONFIG, getAuthHeaders, apiError, apiLog } from './api.js';
import { logSSLInstructions, resetSSLAccepted } from '../utils/sslHelper.js';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth headers to every request
    const authHeaders = getAuthHeaders();
    config.headers = { ...config.headers, ...authHeaders };
    
    apiLog(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    apiError('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
axiosInstance.interceptors.response.use(
  (response) => {
    apiLog(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    if (response) {
      // Server responded with error status
      apiError(`❌ ${config?.method?.toUpperCase()} ${config?.url} - ${response.status}:`, response.data);
      
      // Handle specific error cases
      if (response.status === 401) {
        // Unauthorized - clear auth token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Network error - potentially SSL/CORS issue
      const errorMessage = error.message || '';
      const isSSLCORSError = errorMessage.includes('CORS') || 
                            errorMessage.includes('Cross-Origin') ||
                            errorMessage.includes('Failed to fetch') ||
                            errorMessage.includes('net::ERR_CERT') ||
                            errorMessage.includes('SSL') ||
                            error.code === 'ERR_NETWORK';
      
      if (isSSLCORSError) {
        console.group('🔐 SSL/CORS Error Detected');
        console.error('Error details:', error);
        logSSLInstructions();
        resetSSLAccepted();
        
        // Dispatch custom event to trigger SSL modal
        window.dispatchEvent(new CustomEvent('ssl-error', { detail: error }));
        console.groupEnd();
      }
      
      apiError('Network error:', error.message);
    } else {
      // Something else happened
      apiError('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Retry logic for failed requests
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await axiosInstance(config);
  } catch (error) {
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && isRetryableError(error)) {
      apiLog(`🔄 Retrying request (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS}):`, config.url);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
      
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Check if error is retryable
const isRetryableError = (error) => {
  return (
    !error.response || // Network error
    error.response.status >= 500 || // Server error
    error.response.status === 408 || // Request timeout
    error.response.status === 429    // Too many requests
  );
};

// Enhanced axios instance with retry capability
export const axiosWithRetry = {
  get: (url, config = {}) => retryRequest({ ...config, method: 'get', url }),
  post: (url, data, config = {}) => retryRequest({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => retryRequest({ ...config, method: 'put', url, data }),
  patch: (url, data, config = {}) => retryRequest({ ...config, method: 'patch', url, data }),
  delete: (url, config = {}) => retryRequest({ ...config, method: 'delete', url }),
};

export default axiosInstance;
