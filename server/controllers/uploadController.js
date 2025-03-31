const cloudinary = require('../configs/cloudinary.js');
const User = require('../models/User');
const redisClient = require('../configs/redis');

const updateUserProfile = async (req, res) => {
  try {
    // Authorization check
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized profile update attempt' });
    }

    const { username } = req.body;
    const {subscribedTopics} = req.body;
    const file = req.file;
    const userId = req.params.userId;

    // Validate at least one update field exists
    if (!file && !username && !subscribedTopics) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    const updateData = {};
    let cloudinaryResult;

    // Process file upload
    if (file) {
      cloudinaryResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'profile-pics',
            resource_type: 'auto',
            format: 'webp' 
          },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(file.buffer);
      });
      updateData.profilePic = cloudinaryResult.secure_url;
    }

    // Process username update
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      updateData.username = username;
    }

    //update subscribedTopics
    if(subscribedTopics && subscribedTopics.length > 0 ) {
      const existingTopics = await User.findOne({ subscribedTopics });
      if (existingTopics) {
        return res.status(409).json({ error: 'Subscribed topics already exist' });
      }
      updateData.subscribedTopics = subscribedTopics;
    }

    // Update database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v'); // Exclude sensitive fields

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update Redis cache
    await Promise.all([
      redisClient.setEx(
        `user:${userId}`,
        3600,
        JSON.stringify(updatedUser)
      ),
      redisClient.del(`user:username:${req.user.username}`) // Invalidate old username cache
    ]);

    // Return standardized response
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        role: updatedUser.role,
        joined: updatedUser.createdAt,
        queries: updatedUser.queries,
        discussions: updatedUser.discussions,
        achievements: updatedUser.achievements,
        subscribedTopics: updatedUser.subscribedTopics,
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle Cloudinary errors specifically
    if (error.message.includes('File size too large')) {
      return res.status(413).json({ error: 'File size exceeds 5MB limit' });
    }
    
    res.status(500).json({ 
      error: error.message || 'Server error during profile update' 
    });
  }
};

module.exports = { updateUserProfile };