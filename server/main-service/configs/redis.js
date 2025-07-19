const redis = require('redis');

let client;

// Create Redis client with support for both URL and individual config
if (process.env.REDIS_URL) {
  // Use Redis URL if provided (for production/cloud services)
  client = redis.createClient({
    url: process.env.REDIS_URL
  });
} else {
  // Use individual Redis configuration
  const REDIS_HOST = process.env.REDIS_HOST;
  const REDIS_PORT = process.env.REDIS_PORT;
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

  client = redis.createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    password: REDIS_PASSWORD,
  });
}

(async () => {
  try {
    await client.connect(); // For Redis 4.0+
    console.log(`🔗 Redis Connected to: ${process.env.REDIS_URL ? 'Cloud Redis' : `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`}`);
  } catch (err) {
    console.error("❌ Redis Connection Error:", err);
    process.exit(1); // Exit if Redis is critical for the application
  }
})();

client.on("error", (err) => console.error("❌ Redis Error:", err));
client.on("ready", () => console.log("✅ Redis Ready"));
client.on("reconnecting", () => console.log("🔄 Redis Reconnecting..."));

module.exports = client;