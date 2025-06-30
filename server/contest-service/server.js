require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io available globally
global.io = io;

// Initialize socket service in the app
app.initializeSocket(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Handle joining contest rooms
  socket.on('join_contest', (contestId) => {
    socket.join(`contest_${contestId}`);
    console.log(`📍 Socket ${socket.id} joined contest room: ${contestId}`);
  });
  
  // Handle leaving contest rooms
  socket.on('leave_contest', (contestId) => {
    socket.leave(`contest_${contestId}`);
    console.log(`📍 Socket ${socket.id} left contest room: ${contestId}`);
  });
  
  // Handle user-specific rooms
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Socket ${socket.id} joined user room: ${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Contest service running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});
