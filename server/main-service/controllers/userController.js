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

const fetchSingleUserById = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from the request parameters

    if (!userId) {
      return res.status(400).json({ error: "Invalid or missing userId" });
    }

    // Fetch the user whose ID matches the given userId
    const user = await User.findById(userId).select("_id username profilePic email createdAt followerCount followingCount");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user }); // Return the fetched user
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

/**
 * Fetch all users with optional search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchAllUsers = async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    const currentUserId = req.user.id;

    let query = { _id: { $ne: currentUserId } }; // Exclude current user

    // Add search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select("_id username profilePic email createdAt followerCount followingCount")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { fetchUsersByIds, fetchSingleUserById, fetchAllUsers };