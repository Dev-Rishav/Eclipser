// src/config/api.js
/**
 * Centralized API Configuration
 * Manages all API endpoints and configurations for the application
 */

// Environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const CONTEST_API_URL = import.meta.env.VITE_CONTEST_API_URL || 'http://localhost:3001';
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_URL,
  SOCKET_URL: SOCKET_URL,
  CONTEST_BASE_URL: CONTEST_API_URL,
  ENVIRONMENT: ENVIRONMENT,
  
  // Timeout configurations
  TIMEOUT: 30000, // 30 seconds
  
  // Request retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    REFRESH: `${API_URL}/api/auth/refresh`,
  },
  
  // Posts
  POSTS: {
    BASE: `${API_URL}/api/posts`,
    BY_ID: (postId) => `${API_URL}/api/posts/${postId}`,
    BY_TAGS: `${API_URL}/api/posts/tags`,
    REMAINING: `${API_URL}/api/posts/remainingPosts`,
    BY_USER: (userId) => `${API_URL}/api/posts/user/${userId}`,
    LIKE: (postId) => `${API_URL}/api/posts/like/${postId}`,
    COMMENT: (postId) => `${API_URL}/api/posts/comment/${postId}`,
    DELETE: (postId) => `${API_URL}/api/posts/${postId}`,
    TAG_STATS: `${API_URL}/api/posts/tagStats`,
  },
  
  // Users
  USERS: {
    BASE: `${API_URL}/api/users`,
    BULK: `${API_URL}/api/users/bulk`,
    FOLLOW: `${API_URL}/api/users/follow`,
    UNFOLLOW: `${API_URL}/api/users/unfollow`,
    FOLLOW_STATS: (userId) => `${API_URL}/api/users/followStats/${userId}`,
  },
  
  // Messages
  MESSAGES: {
    BASE: (id) => `${API_URL}/api/messages/${id}`,
    RECENT_CHATS: `${API_URL}/api/messages/onetoone/recentChats`,
  },
  
  // Upload
  UPLOAD: {
    PROFILE: (userId) => `${API_URL}/api/user/profile/${userId}`,
  },
  
  // Contest Service
  CONTEST: {
    BASE: `${CONTEST_API_URL}/api/contest`,
    SUBMIT: `${CONTEST_API_URL}/api/contest/submit`,
    RESULTS: (contestId) => `${CONTEST_API_URL}/api/contest/${contestId}/results`,
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Default request configuration
export const DEFAULT_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  },
  timeout: API_CONFIG.TIMEOUT,
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    enableLogging: true,
    enableDebug: true,
    apiLogging: true,
  },
  production: {
    enableLogging: false,
    enableDebug: false,
    apiLogging: false,
  },
};

// Current environment configuration
export const CURRENT_ENV_CONFIG = ENV_CONFIG[ENVIRONMENT] || ENV_CONFIG.development;

// Utility function to check if we're in production
export const isProduction = () => ENVIRONMENT === 'production';

// Utility function to check if we're in development
export const isDevelopment = () => ENVIRONMENT === 'development';

// Console logging utility that respects environment
export const apiLog = (...args) => {
  if (CURRENT_ENV_CONFIG.apiLogging) {
    console.log('[API]', ...args);
  }
};

export const apiError = (...args) => {
  if (CURRENT_ENV_CONFIG.enableLogging) {
    console.error('[API ERROR]', ...args);
  }
};

export const apiDebug = (...args) => {
  if (CURRENT_ENV_CONFIG.enableDebug) {
    console.debug('[API DEBUG]', ...args);
  }
};
