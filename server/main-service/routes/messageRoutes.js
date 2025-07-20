const express = require("express");
const { 
  getMessages, 
  getAllMessages, 
  getRecentChats, 
  markMessagesAsRead, 
  getUnreadCount 
} = require("../controllers/messageController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Message retrieval operations (sending via Socket.IO only)
router.get("/:userId", authMiddleware, getMessages);

// Chat management
router.get("/onetoone/allChats", authMiddleware, getAllMessages);
router.get("/onetoone/recentChats", authMiddleware, getRecentChats);

// Message status management
router.put("/read/:otherUserId", authMiddleware, markMessagesAsRead);
router.get("/unread/count", authMiddleware, getUnreadCount);

module.exports = router;
