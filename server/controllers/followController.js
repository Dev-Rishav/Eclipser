const Follow = require('../models/Follow');

exports.followUser = async (req, res,next) => {
  const { followerId, followingId } = req.body;

  try {
    await Follow.create({ follower: followerId, following: followingId });
    next();
  } catch (error) {
    console.error('Error following user:', error);
    res.status(400).json({ message: 'Error following user', error });
  }
};

exports.unfollowUser = async (req, res,next) => {
  const { followerId, followingId } = req.body;

  try {
    await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    next();
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(400).json({ message: 'Error unfollowing user', error });
  }
};

exports.getFollowStatus = async (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;

  try {
    if (!followerId || !followingId) {
      return res.status(400).json({ message: "Invalid follower or following ID" });
    }

    const isFollowing = await Follow.findOne({ follower: followerId, following: followingId });

    res.status(200).json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
