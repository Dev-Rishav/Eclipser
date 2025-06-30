const express = require("express");
const { sendMessage, getMessages, getAllMessages, getRecentChats } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/",  sendMessage);
router.get("/:userId",authMiddleware, getMessages);
router.get("/onetoone/allChats", authMiddleware, getAllMessages);
router.get("/onetoone/recentChats", authMiddleware, getRecentChats);

module.exports = router;
