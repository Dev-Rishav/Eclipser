const User = require("../models/User"); // Import the User model

/**
 * Fetch users by an array of user IDs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchUsersByIds = async (req, res) => {
  try {
    const { userIds } = req.body; // Extract userIds from the request body

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: "Invalid or missing userIds array" });
    }

    // Fetch users whose IDs match the given userIds
    const users = await User.find({ _id: { $in: userIds } }).select("_id username profilePic");

    res.status(200).json(users); // Return the fetched users
  } catch (error) {
    console.error("Error fetching users by IDs:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { fetchUsersByIds };