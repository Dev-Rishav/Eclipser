// const { io } = require("socket.io-client");
import {io} from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
  transports: ['websocket'], // Optional: use only WebSocket
  auth: {
    token: "your_auth_token_here", // If your backend requires auth
  },
});

// Connection event
socket.on("connect", () => {
  console.log(`✅ Connected with ID: ${socket.id}`);

  socket.emit("register", "661fcde4a80cdbba9e6c88d2"); // Register the user with their ID

  // Emit a message to the server
  socket.emit("privateMessage", {
    senderId: "67e91e7adc8b54a63145b0a8",
    receiverId: "67efe809bcd3d854041263f2",
    content: "Hey there! This is  wodfheiwsjfhsduhusdf.",
  });
});

// Listen for incoming messages
socket.on("newPrivateMessage", (message) => {
  console.log("📩 New message received:", message);
});

// Handle disconnect
socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
