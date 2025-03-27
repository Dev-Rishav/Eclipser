const { Server } = require("socket.io");

let io;
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware to check for authentication token (if needed)
  io.use((socket, next) => {
    console.log("Socket middleware triggered");
    // Example: Verify token if you have authentication logic
    next();
  });

  io.on("connection", (socket) => {
    console.log(`${socket.id} User Connected`);

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log(`${socket.id} User Disconnected`);
    });
  });
  
};




// Exporting function to get `io` instance
const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIo };
