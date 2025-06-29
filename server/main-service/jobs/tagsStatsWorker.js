const client = require('../configs/redis');
const cron = require('node-cron');

async function updateTagStats() {
  try {
    console.log("🚀 Starting tag stats update...");

    let cursor = 0;
    const tagCounts = {};

    do {
      const reply = await client.scan(cursor, { MATCH: 'post:*', COUNT: 100 });
      cursor = parseInt(reply.cursor, 10);
      const keys = reply.keys;

      for (const key of keys) {
        const post = await client.hGetAll(key);
        if (post.tags) {
          let tags;
          try {
            tags = JSON.parse(post.tags);
          } catch {
            continue;
          }
          for (const tag of tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        }
      }
    } while (cursor !== 0);

    await client.set('tagStats', JSON.stringify(tagCounts));
    console.log("✅ Tag stats updated");
  } catch (err) {
    console.error("❌ Tag stats update failed:", err);
  }
}

// Schedule the cron job
function startTagStatsJob() {
  cron.schedule('*/5 * * * *', updateTagStats); // Every 5 minutes
  updateTagStats(); // Also run on server start
}

module.exports = startTagStatsJob;

