const Message = require('../models/Message');
const User = require('../models/User'); 

const syncIndexes = async () => {
  try {
    console.log('📦 Syncing indexes...');

    await Message.syncIndexes();
    console.log('✅ Message indexes synced.');

    // Add more models if needed
    await User.syncIndexes();
    console.log('✅ User indexes synced.');

  } catch (error) {
    console.error('❌ Error syncing indexes:', error);
  }
};

module.exports = syncIndexes;
