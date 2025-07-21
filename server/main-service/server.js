const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import path module for resolving paths
const connectDB = require('./configs/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const cors = require('cors');
const { initSocket } = require('./configs/socket');
const { createServer } = require('http');
const uploadRoutes = require('./routes/uploadRoutes');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const { streamUpdates } = require('./controllers/postController');
const startTagStatsJob = require('./jobs/tagsStatsWorker');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const validateEnvVariables = require('./utils/validateEnv');
const searchRoutes = require('./routes/searchRoute');
require("./jobs/onlineCleanup")

// Load environment variables from the root directory
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

// Validate environment variables
const envValidation = validateEnvVariables();
if (!envValidation.valid) {
  console.error('❌ Environment validation failed. Exiting...');
  process.exit(1);
}

// Connect to the database
connectDB();

const app = express();
const server = createServer(app);

// Initialize WebSockets
initSocket(server);

// Middleware
app.use(express.json());


// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN ,
  methods: ["GET", "POST","OPTIONS","PUT","DELETE","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));




// SSE Endpoint
app.get('/stream', streamUpdates);



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', uploadRoutes);
app.use('/api/users',userRoutes)
app.use("/api/messages",messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search',searchRoutes);
app.get('/', (req, res) => {
    res.send('API is running on secure connection');
});


// Health check route
app.use('/greet', (req, res) => {
  res.send('Hello, World!');
});


//Background jobs
startTagStatsJob();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// setInterval(() => {
//     const memoryUsage = process.memoryUsage();
//     console.log({
//         rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
//         heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
//         heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
//         external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
//     });
// }, 5000); // Every 5s


// Start the server
const PORT = process.env.PORT || process.env.DEFAULT_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  console.log(`Frontend URL: ${process.env.CLIENT_URL || process.env.CORS_ORIGIN}`);
  console.log(`Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
});