module.exports = {
  apps: [
    {
      name: 'contest-service',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        MONGO_URI: 'mongodb://localhost:27017/contest-service',
        USE_LIGHTWEIGHT_WORKER: 'false'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/contest-service',
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || 6379,
        USE_LIGHTWEIGHT_WORKER: 'true',
        NODE_OPTIONS: '--max-old-space-size=400'
      },
      error_file: './logs/contest-service-error.log',
      out_file: './logs/contest-service-out.log',
      log_file: './logs/contest-service-combined.log',
      time: true,
      max_restarts: 5,
      min_uptime: '10s',
      kill_timeout: 5000
    }
  ]
};
