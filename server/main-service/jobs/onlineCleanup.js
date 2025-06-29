const cron = require('node-cron');
const redis = require('../configs/redis'); // Your Redis instance/config

// Optional TTL map (if you're using one to simulate expiry)
const TTL_HASH_KEY = 'user_last_seen';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🧹 Running online users cleanup job...');

  try {
    const onlineUsers = await redis.sMembers('online_users');

    if (!onlineUsers.length) {
      console.log('⚪ No users online currently.');
      return;
    }

    console.log(`🟢 Found ${onlineUsers.length} online users.`);

    // Optional TTL/last seen logic
    const now = Date.now();
    const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

    for (const userId of onlineUsers) {
      const lastSeen = await redis.hGet(TTL_HASH_KEY, userId);
      if (lastSeen && now - Number(lastSeen) > STALE_THRESHOLD) {
        await redis.sRem('online_users', userId);
        await redis.hDel(TTL_HASH_KEY, userId);
        console.log(`⛔ Removed stale user ${userId} from online_users`);
      }
    }

    console.log('✅ Cleanup job finished.');

  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  }
});
