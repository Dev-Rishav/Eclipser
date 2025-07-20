const Follow = require('../models/Follow');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

exports.followUser = async (req, res, next) => {
  const { followerId, followingId } = req.body;

  try {
    await Follow.create({ follower: followerId, following: followingId });
    
    // Send notification to the user being followed
    try {
      await notificationService.notifyNewFollower(followingId, followerId);
    } catch (notificationError) {
      console.error("Error sending follow notification:", notificationError);
      // Don't fail the follow operation if notification fails
    }
    
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

// Get followers list for a user
exports.getFollowers = async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;
  
  try {
    // Find all follow records where this user is being followed
    const followerRecords = await Follow.find({ following: userId })
      .populate('follower', '_id username profilePic email createdAt followerCount followingCount')
      .lean();

    // Get the followers with their user info
    const followers = followerRecords.map(record => {
      const follower = record.follower;
      return {
        _id: follower._id,
        username: follower.username,
        profilePic: follower.profilePic,
        email: follower.email,
        createdAt: follower.createdAt,
        followerCount: follower.followerCount || 0,
        followingCount: follower.followingCount || 0,
        // Check if current user follows this follower
        isFollowing: false // We'll update this in a batch query below
      };
    });

    // Batch check if current user follows any of these followers
    if (followers.length > 0) {
      const followerIds = followers.map(f => f._id);
      const currentUserFollowing = await Follow.find({
        follower: currentUserId,
        following: { $in: followerIds }
      }).lean();

      const followingSet = new Set(currentUserFollowing.map(f => f.following.toString()));
      followers.forEach(follower => {
        follower.isFollowing = followingSet.has(follower._id.toString());
      });
    }

    res.status(200).json({
      success: true,
      followers,
      count: followers.length
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Failed to fetch followers", error });
  }
};

// Get following list for a user
exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    // Find all follow records where this user is following others
    const followingRecords = await Follow.find({ follower: userId })
      .populate('following', '_id username profilePic email createdAt followerCount followingCount')
      .lean();

    // Get the following users with their info
    const following = followingRecords.map(record => {
      const followedUser = record.following;
      return {
        _id: followedUser._id,
        username: followedUser.username,
        profilePic: followedUser.profilePic,
        email: followedUser.email,
        createdAt: followedUser.createdAt,
        followerCount: followedUser.followerCount || 0,
        followingCount: followedUser.followingCount || 0,
        // Check if current user follows this user
        isFollowing: false // We'll update this in a batch query below
      };
    });

    // Batch check if current user follows any of these users
    if (following.length > 0) {
      const followingIds = following.map(f => f._id);
      const currentUserFollowing = await Follow.find({
        follower: currentUserId,
        following: { $in: followingIds }
      }).lean();

      const followingSet = new Set(currentUserFollowing.map(f => f.following.toString()));
      following.forEach(user => {
        user.isFollowing = followingSet.has(user._id.toString());
      });
    }

    res.status(200).json({
      success: true,
      following,
      count: following.length
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Failed to fetch following", error });
  }
};
