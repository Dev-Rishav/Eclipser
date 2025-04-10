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
