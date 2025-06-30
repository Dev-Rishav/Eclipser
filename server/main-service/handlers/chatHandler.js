const Message = require("../models/Message");
const client = require("../configs/redis");


const connectedUsers = new Map();

const handleChatSocket = (io, socket) => {
  socket.on("register", async (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    
    await client.sAdd("online_users", userId.toString());
    console.log(`✅ User ${userId} registered & marked online`);
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
      io.to(senderId).emit("newPrivateMessage", message);  //used for acknowledgment
      

      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("private_message", message);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    }
  });

  socket.on('ping_server', async () => {
    console.log("Server pinged by client");
    
    if (socket.userId) {
      await client.expire(`online:${socket.userId}`, 60); // Refresh TTL
    }
  });

  socket.on("disconnect", async() => {
    for (const [userId, sockId] of connectedUsers.entries()) {
      if (sockId === socket.id) {
        connectedUsers.delete(userId);
        await client.sRem("online_users", userId);
        break;
      }
    }
  });
};

module.exports = handleChatSocket;
