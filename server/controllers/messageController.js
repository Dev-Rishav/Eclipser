const Message = require("../models/Message");
const User = require('../models/User');
const redis = require('../configs/redis');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });
    await message.save();
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

//gets all messages between two users
exports.getMessages = async (req, res) => {
  const { userId } = req.params; // person you are chatting with
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, messages });
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
            userId: "$_id",
            latestMessage: 1,
          }
        }
      ]);

      console.log("Recent Messages:", recentMessages);
      
  
      // Step 2: Fetch user info in bulk
      const userIds = recentMessages.map(msg => msg.userId);
      const users = await User.find({ _id: { $in: userIds } }, '_id username profilePic');
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = user;
      });
  
      // Step 3: Prepare final response
      const chats = await Promise.all(recentMessages.map(async (message) => {
        const otherUserId = message.userId;
        const unreadCount = await Message.countDocuments({
          senderId: otherUserId,
          receiverId: userId,
          seen: false
        });
  
        const isOnline = await redis.exists(`online:${otherUserId}`);
        const user = userMap[otherUserId] || { _id: otherUserId, username: 'Unknown', profilePic: null };
  
        return {
          id: otherUserId,
          user: {
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic,
          },
          lastMessage: {
            content: message.latestMessage.content,
            senderId: message.latestMessage.senderId,
            sentAt: message.latestMessage.sentAt,
            seen: message.latestMessage.seen,
            type: message.latestMessage.type || 'text',
          },
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
  
  