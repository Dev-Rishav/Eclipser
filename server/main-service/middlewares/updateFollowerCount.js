const User = require('../models/User');
const Follow = require('../models/Follow');

const updateFollowerCount = async (req, res, next) => {
  try {
    console.log('Middleware triggered for updating follower count');
    
    const { followerId, followingId } = req.body;

    const followerCount = await Follow.countDocuments({ following: followingId });
    const followingCount = await Follow.countDocuments({ follower: followerId });

    await User.findByIdAndUpdate(followingId, { followerCount });
    await User.findByIdAndUpdate(followerId, { followingCount });

    res.status(200).json({ success: true, message: "Follow updated" });
  } catch (error) {
    console.error('Middleware error:', error);
    res.status(500).json({ message: 'Error updating follower counts' });
  }
};

module.exports = updateFollowerCount;
