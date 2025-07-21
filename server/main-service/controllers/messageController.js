const Message = require("../models/Message");
const User = require('../models/User');
const redis = require('../configs/redis');

// Note: Message sending is now handled via Socket.IO only (chatHandler.js)
// This controller only handles message retrieval operations

//gets all messages between two users
exports.getMessages = async (req, res) => {
  const { userId } = req.params; // person you are chatting with
  const page = parseInt(req.query.page) || 1; // default to page 1
  const limit = parseInt(req.query.limit) || 50; // default to 50 messages per page
  const skip = (page - 1) * limit;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }
  
  try {
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    })
    .populate('senderId', '_id username profilePic')
    .populate('receiverId', '_id username profilePic')
    .sort({ sentAt: 1 }) // Sort ascending for chat order
    .skip(skip)
    .limit(limit)
    .lean();

    // Transform messages to match frontend format
    const transformedMessages = messages.map(msg => ({
      _id: msg._id,
      sender: msg.senderId._id,
      receiver: msg.receiverId._id,
      content: msg.content,
      timestamp: msg.sentAt,
      senderName: msg.senderId.username,
      senderProfilePic: msg.senderId.profilePic,
      seen: msg.seen
    }));

    // Mark messages from the other user as read
    await Message.updateMany(
      { 
        senderId: userId, 
        receiverId: req.user._id, 
        seen: false 
      },
      { seen: true }
    );

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    });

    res.status(200).json({ 
      success: true,
      messages: transformedMessages,
      pagination: {
        totalMessages,
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (error) {
    console.error("error happened while fetching messages", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};


exports.getAllMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    })
      .sort({ createdAt: 1 }) // sort by time
      .lean();

    const chats = {};

    messages.forEach(msg => {
      const otherUserId = msg.senderId.toString() === userId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      if (!chats[otherUserId]) {
        chats[otherUserId] = [];
      }

      chats[otherUserId].push(msg);
    });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chats" });
  } 
  };

  
exports.getRecentChats = async (req, res) => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Step 1: Aggregate the messages to get the latest message per chat
      const recentMessages = await Message.aggregate([
        { 
          $match: { 
            $or: [{ senderId: userId }, { receiverId: userId }] 
          }
        },
        { 
          $sort: { sentAt: -1 } 
        },
        { 
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$receiverId",
                "$senderId"
              ]
            },
            latestMessage: { $first: "$$ROOT" },
          }
        },
        { 
          $skip: skip 
        },
        { 
          $limit: limit 
        },
        {
          $project: {
            otherUser: "$_id",
            latestMessage: 1,
          }
        }
      ]);

      console.log("Recent Messages:", recentMessages);
      
  
      // Step 2: Fetch user info in bulk
      const userIds = recentMessages.map(msg => msg.otherUser);
      const users = await User.find({ _id: { $in: userIds } }, '_id username profilePic');
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = user;
      });
  
      // Step 3: Prepare final response
      const chats = await Promise.all(recentMessages.map(async (message) => {
        const otherUserId = message.otherUser;
        const unreadCount = await Message.countDocuments({
          senderId: otherUserId,
          receiverId: userId,
          seen: false
        });
  
        const isOnline = await redis.exists(`online:${otherUserId}`);
        const user = userMap[otherUserId.toString()] || { _id: otherUserId, username: 'Unknown', profilePic: null };
  
        return {
          otherUser: otherUserId,
          user: {
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic,
          },
          lastMessage: message.latestMessage.content,
          lastMessageTime: message.latestMessage.sentAt,
          unreadCount,
          isOnline: !!isOnline,
        };
      }));
  
      res.status(200).json({
        success: true,
        page,
        limit,
        totalChats: recentMessages.length,
        chats,
      });
    } catch (error) {
      console.error('❌ Error in getRecentChats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch recent chats' });
    }
  };

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    // Mark all unread messages from the other user as read
    const result = await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        seen: false
      },
      { seen: true }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      seen: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};
  
// Send messages via API (for persistence, handled by Socket.IO for real-time)
exports.sendMessages = async (req, res) => {
  const { receiver, content,senderName } = req.body;

  if (!receiver || !content) {
    return res.status(400).json({ success: false, message: "Receiver ID and content are required" });
  }

  try {
    const newMessage = new Message({
      senderId: req.user._id,
      receiverId: receiver,
      senderName: senderName,
      content,
      sentAt: new Date(),
      seen: false
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};