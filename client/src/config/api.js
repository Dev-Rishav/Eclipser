// src/config/api.js
/**
 * Centralized API Configuration
 * Manages all API endpoints and configurations for the application
 */

// Environment variables - NO FALLBACKS (fail fast if not configured)
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const CONTEST_API_URL = import.meta.env.VITE_CONTEST_API_URL;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;

console.log(`API_URL: ${API_URL}`);
console.log(`SOCKET_URL: ${SOCKET_URL}`);
console.log(`CONTEST_API_URL: ${CONTEST_API_URL}`);
console.log(`ENVIRONMENT: ${ENVIRONMENT}`);
// console.log(isProduction() ? 'Running in production mode' : 'Running in development mode');



// Validate required environment variables
if (!API_URL) {
  throw new Error('❌ VITE_API_URL environment variable is required but not set');
}
if (!SOCKET_URL) {
  throw new Error('❌ VITE_SOCKET_URL environment variable is required but not set');
}
if (!CONTEST_API_URL) {
  throw new Error('❌ VITE_CONTEST_API_URL environment variable is required but not set');
}
if (!ENVIRONMENT) {
  throw new Error('❌ VITE_ENVIRONMENT environment variable is required but not set');
}

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
    By_TYPE: (type) => `${API_URL}/api/posts/type/${type}`,
  },
  
  // Users
  USERS: {
    BASE: `${API_URL}/api/users`,
    BULK: `${API_URL}/api/users/bulk`,
    BY_ID: (userId) => `${API_URL}/api/users/getUser/${userId}`,
    FOLLOW: `${API_URL}/api/users/follow`,
    UNFOLLOW: `${API_URL}/api/users/unfollow`,
    FOLLOW_STATS: (userId) => `${API_URL}/api/users/followStats/${userId}`,
    FOLLOWERS: (userId) => `${API_URL}/api/users/followers/${userId}`,
    FOLLOWING: (userId) => `${API_URL}/api/users/following/${userId}`,
  },
  
  // Messages
  MESSAGES: {
    CREATE: `${API_URL}/api/messages`,
    BY_USER: (userId) => `${API_URL}/api/messages/${userId}`,
    ALL_CHATS: `${API_URL}/api/messages/onetoone/allChats`,
    RECENT_CHATS: `${API_URL}/api/messages/onetoone/recentChats`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: `${API_URL}/api/notifications`,
    STREAM: `${API_URL}/api/notifications/stream`,
    UNREAD_COUNT: `${API_URL}/api/notifications/unread-count`,
    MARK_READ: (notificationId) => `${API_URL}/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: `${API_URL}/api/notifications/mark-all-read`,
    DELETE: (notificationId) => `${API_URL}/api/notifications/${notificationId}`,
    TEST: `${API_URL}/api/notifications/test`,
  },
  
  // Upload
  UPLOAD: {
    PROFILE: (userId) => `${API_URL}/api/user/profile/${userId}`,
  },
  
  // Contest Service
  CONTEST: {
    BASE: `${CONTEST_API_URL}/api/contest`,
    CREATE: `${CONTEST_API_URL}/api/contest/create`,
    JOIN: `${CONTEST_API_URL}/api/contest/join`,
    SUBMIT: `${CONTEST_API_URL}/api/contest/submit`,
    ALL: `${CONTEST_API_URL}/api/contest/all`,
    BY_ID: (contestId) => `${CONTEST_API_URL}/api/contest/${contestId}`,
    HISTORY: (userId) => `${CONTEST_API_URL}/api/contest/history/${userId}`,
    SUBMISSIONS: (contestId) => `${CONTEST_API_URL}/api/contest/${contestId}/submissions`,
    USER_SUBMISSIONS: (contestId, userId) => `${CONTEST_API_URL}/api/contest/${contestId}/submissions/${userId}`,
    UPDATE_STATUS: (contestId) => `${CONTEST_API_URL}/api/contest/${contestId}/status`,
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
