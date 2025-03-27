const redis = require('redis');

// Use environment variables for Redis configuration
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

(async () => {
  try {
    await client.connect(); // For Redis 4.0+
    console.log("🔗 Redis Connected");
  } catch (err) {
    console.error("❌ Redis Connection Error:", err);
  }
})();

client.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = client;