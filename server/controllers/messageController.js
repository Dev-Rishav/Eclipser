const Message = require("../models/Message");

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
    }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("error happened while fetching messages", error);
    
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};
