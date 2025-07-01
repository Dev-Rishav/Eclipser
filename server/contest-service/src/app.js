const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contestRoutes = require('./routes/contestRoutes');
const testRoutes = require('./routes/testRoutes');
const socketService = require('./utils/socketService');

const app = express();
app.use(cors());
app.use(express.json());

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
    require('./workers/codeWorker');
    console.log('✅ Docker-based code worker initialized');
  }
};

app.use('/api/contest', contestRoutes);
app.use('/api', testRoutes);

module.exports = app;
