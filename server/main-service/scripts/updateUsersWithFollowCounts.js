const mongoose = require('mongoose');
const User = require('../models/User'); // adjust the path if needed
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find();

    const updates = users.map(async (user) => {
      user.followerCount = user.followerCount ?? 0;
      user.followingCount = user.followingCount ?? 0;
      return user.save();
    });

    await Promise.all(updates);
    console.log('✅ All users updated with default follow counts');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update users:', err);
    process.exit(1);
  }
};

run();
