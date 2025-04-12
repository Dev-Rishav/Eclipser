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

// Load environment variables from the root directory
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1); // Exit the application if a required variable is missing
  }
});

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
  origin: "http://localhost:5173", // Replace with your frontend URL
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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  
});