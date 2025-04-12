const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/",  sendMessage);
router.get("/:userId",authMiddleware, getMessages);

module.exports = router;
