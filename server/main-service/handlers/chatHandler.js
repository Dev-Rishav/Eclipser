const Message = require("../models/Message");
const User = require("../models/User");
const client = require("../configs/redis");

const connectedUsers = new Map();

const handleChatSocket = (io, socket) => {
  console.log(`🚀 Socket connected: ${socket.id}`);

  // User registration
  socket.on("register", async (userId) => {
    try {
      if (!userId) {
        console.error("❌ Invalid userId in register event");
        return;
      }

      // Store user connection
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      
      // Join user-specific room
      socket.join(`user:${userId}`);
      
      // Mark user as online in Redis
      await client.sAdd("online_users", userId.toString());
      await client.setEx(`online:${userId}`, 300, "1"); // 5 minutes TTL
      
      console.log(`✅ User ${userId} registered & marked online`);
      
      // Broadcast online status to all connected users
      socket.broadcast.emit('user_online', { userId: userId.toString() });
      
      // Send current online users to the newly connected user
      const onlineUsers = await client.sMembers("online_users");
      socket.emit('online_users', onlineUsers);
      
    } catch (error) {
      console.error("❌ Registration error:", error);
    }
  });

  // Handle private messages
  socket.on("private_message", async (messageData) => {
    try {
      const { sender, receiver, content, timestamp, senderName } = messageData;
      
      if (!sender || !receiver || !content) {
        console.error("❌ Missing required fields in private_message:", messageData);
        socket.emit('message_error', { error: 'Missing required fields' });
        return;
      }

      // Save message to database
      const message = new Message({
        senderId: sender,
        receiverId: receiver,
        content,
        sentAt: timestamp || new Date(),
        seen: false
      });

      await message.save();
      console.log(`📨 Message saved: ${sender} -> ${receiver}`);

      // Get sender info for the message
      const senderUser = await User.findById(sender).select('username profilePic');
      
      // Prepare message for real-time delivery
      const realtimeMessage = {
        _id: message._id,
        sender: sender,
        receiver: receiver,
        content: content,
        timestamp: message.sentAt,
        senderName: senderUser?.username || senderName,
        senderProfilePic: senderUser?.profilePic,
        seen: false
      };

      // Send to receiver if online
      io.to(`user:${receiver}`).emit('private_message', realtimeMessage);
      
      // Send acknowledgment to sender
      socket.emit('message_sent', {
        _id: message._id,
        receiver: receiver,
        content: content,
        timestamp: message.sentAt,
        status: 'delivered'
      });

      console.log(`✅ Real-time message delivered: ${sender} -> ${receiver}`);
      
    } catch (error) {
      console.error("❌ Private message error:", error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on("typing", async (data) => {
    try {
      const { userId, username, targetUserId } = data;
      
      if (!targetUserId) return;
      
      // Send typing indicator to target user
      io.to(`user:${targetUserId}`).emit('typing', {
        userId: userId,
        username: username
      });
      
      console.log(`⌨️ Typing: ${username} -> ${targetUserId}`);
      
    } catch (error) {
      console.error("❌ Typing error:", error);
    }
  });

  // Handle stop typing
  socket.on("stop_typing", async (data) => {
    try {
      const { userId, targetUserId } = data;
      
      if (!targetUserId) return;
      
      // Send stop typing to target user
      io.to(`user:${targetUserId}`).emit('stop_typing', {
        userId: userId
      });
      
    } catch (error) {
      console.error("❌ Stop typing error:", error);
    }
  });

  // Handle message read status
  socket.on("mark_message_read", async (data) => {
    try {
      const { messageId, userId } = data;
      
      // Update message as read
      await Message.findByIdAndUpdate(messageId, { seen: true });
      
      // Notify sender that message was read
      const message = await Message.findById(messageId);
      if (message) {
        io.to(`user:${message.senderId}`).emit('message_read', {
          messageId: messageId,
          readBy: userId
        });
      }
      
    } catch (error) {
      console.error("❌ Mark read error:", error);
    }
  });

  // Handle ping for keeping connection alive
  socket.on('ping_server', async () => {
    try {
      if (socket.userId) {
        await client.setEx(`online:${socket.userId}`, 300, "1"); // Refresh TTL
        socket.emit('pong_client');
      }
    } catch (error) {
      console.error("❌ Ping error:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    try {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        // Remove from connected users
        connectedUsers.delete(socket.userId);
        
        // Remove from Redis online users
        await client.sRem("online_users", socket.userId);
        await client.del(`online:${socket.userId}`);
        
        // Broadcast offline status
        socket.broadcast.emit('user_offline', { userId: socket.userId });
        
        console.log(`📴 User ${socket.userId} marked offline`);
      }
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
};

module.exports = handleChatSocket;
