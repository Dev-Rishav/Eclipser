const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const contestRoutes = require('./routes/contestRoutes');
const problemRoutes = require('./routes/problemRoutes');
const testRoutes = require('./routes/testRoutes');
const socketService = require('./utils/socketService');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for problem uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/test-cases');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/contest-service')
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Initialize socket service when io is available
app.initializeSocket = (io) => {
  socketService.init(io);
  console.log('✅ Socket service initialized');
  
  // Initialize the appropriate worker based on environment
  if (process.env.USE_LIGHTWEIGHT_WORKER === 'true' || process.env.NODE_ENV === 'production') {
    require('./workers/lightweightCodeWorker');
    console.log('✅ Lightweight code worker initialized (AWS optimized)');
  } else {
    // Use Docker-based worker for development
    console.log('🔧 Initializing Docker-based worker...');
    require('./workers/enhancedCodeWorker');
    console.log('✅ Enhanced Docker-based code worker initialized');
  }
};

app.use('/api/contest', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api', testRoutes);

module.exports = app;
