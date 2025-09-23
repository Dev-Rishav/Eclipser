const JUDGE0_CONFIG = {
  BASE_URL: 'https://judge0-ce.p.rapidapi.com',
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  RAPIDAPI_HOST: 'judge0-ce.p.rapidapi.com',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  
  // RapidAPI Headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': this.RAPIDAPI_KEY,
      'X-RapidAPI-Host': this.RAPIDAPI_HOST
    };
  },
  
  // Language IDs for Judge0 on RapidAPI
  LANGUAGE_IDS: {
    javascript: 63, // Node.js (18.15.0)
    java: 62,       // OpenJDK (13.0.1)
  },
  
  // Execution limits
  LIMITS: {
    TIME_LIMIT: '2.0',     // seconds
    MEMORY_LIMIT: '128000', // KB (128MB)
    CPU_TIME_LIMIT: '2.0', // seconds
    WALL_TIME_LIMIT: '5.0' // seconds
  },
  
  // API Endpoints
  ENDPOINTS: {
    SUBMISSIONS: '/submissions',
    SUBMISSION_BY_TOKEN: '/submissions/{token}',
    LANGUAGES: '/languages',
    SYSTEM_INFO: '/system_info',
    STATUSES: '/statuses'
  },
  
  // Status IDs
  STATUS_IDS: {
    IN_QUEUE: 1,
    PROCESSING: 2,
    ACCEPTED: 3,
    WRONG_ANSWER: 4,
    TIME_LIMIT_EXCEEDED: 5,
    COMPILATION_ERROR: 6,
    RUNTIME_ERROR_SIGSEGV: 7,
    RUNTIME_ERROR_SIGXFSZ: 8,
    RUNTIME_ERROR_SIGFPE: 9,
    RUNTIME_ERROR_SIGABRT: 10,
    RUNTIME_ERROR_NZEC: 11,
    RUNTIME_ERROR_OTHER: 12,
    INTERNAL_ERROR: 13,
    EXEC_FORMAT_ERROR: 14
  }
};

module.exports = JUDGE0_CONFIG;
