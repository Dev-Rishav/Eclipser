require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const problemRoutes = require('./routes/problems');
const contestRoutes = require('./routes/contests');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all requests
app.use(apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contest-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Contest Service with Judge0 API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      problems: '/api/problems',
      contests: '/api/contests', 
      submissions: '/api/submissions',
      admin: '/api/admin'
    }
  });
});

// API Routes
app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/admin/health',
      'POST /api/problems',
      'GET /api/problems',
      'POST /api/contests',
      'GET /api/contests',
      'POST /api/submissions',
      'GET /api/submissions'
    ]
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

// Start server
const server = app.listen(PORT, () => {
  console.log(`Contest Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/contest-service'}`);
  console.log(`RapidAPI Key configured: ${process.env.RAPIDAPI_KEY ? 'Yes' : 'No'}`);
  
  // Check Judge0 configuration
  const Judge0Service = require('./services/judge0Service');
  const judge0Service = new Judge0Service();
  
  if (!judge0Service.validateConfig()) {
    console.warn('WARNING: Judge0 service is not properly configured. Please set RAPIDAPI_KEY in environment variables.');
  } else {
    console.log('Judge0 service configuration validated');
  }
});

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
