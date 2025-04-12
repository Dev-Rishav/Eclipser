const Message = require("../models/Message");

const connectedUsers = new Map();

const handleChatSocket = (io, socket) => {
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered for chat.`);
  });

  socket.on("privateMessage", async ({ senderId, receiverId, content }) => {
    try {
      const message = new Message({ senderId, receiverId, content });
      if(!senderId || !receiverId || !content) {
        console.error("Missing required fields");
        return;
      }
      await message.save();
      console.log("Message saved:", message);
      

      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("private_message", message);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
};

module.exports = handleChatSocket;
