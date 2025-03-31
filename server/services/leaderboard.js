const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function updateLeaderboard(contestId, userId, score) {
  const key = `contest:${contestId}:leaderboard`;
  await redis.zadd(key, 'NX', score, userId);
  
  // Expire after 1 week
  await redis.expire(key, 604800); 
}

async function getLeaderboard(contestId, limit = 10) {
  return redis.zrevrange(
    `contest:${contestId}:leaderboard`,
    0,
    limit - 1,
    'WITHSCORES'
  );
}

module.exports = { updateLeaderboard, getLeaderboard };