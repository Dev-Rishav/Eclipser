const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profilePic: {
    type: String, // URL of the profile picture
    default: '', // Default to an empty string if no profile picture is provided
  },
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Reference to the Post model
      default: [], // Default to an empty array
    },
  ],
  discussions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Reference to the Post model
      default: [], // Default to an empty array
    },
  ],
  achievements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Reference to the Post model
      default: [], // Default to an empty array
    },
  ],
  subscribedTopics: {
    type: [String], // Array of topic names
    default: [], // Default to an empty array
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  

  if (this.isNew) {
    try {
      // Get the Post model here to prevent potential circular dependency issues
      const Post = mongoose.model('Post');

      // Create the "New Explorer" achievement post
      const achievementPost = new Post({
        title: 'New Explorer',
        postType: 'achievement',
        content: 'The first step on a new journey! Welcome aboard.',
        author: {
          userId: this._id,
          username: this.username,
          profilePic: this.profilePic,
        },
      });
      await achievementPost.save();

      // Add the new achievement's ID to the user's achievements array
      this.achievements.push(achievementPost._id);
    } catch (error) {
      console.error("Failed to create default achievement for new user:", error);
      // Pass the error to stop the save operation if achievement creation fails
      return next(error);
    }
  }

  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;