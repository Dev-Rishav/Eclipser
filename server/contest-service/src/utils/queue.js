const Bull = require('bull');

let codeQueue;

try {
  codeQueue = new Bull('code-evaluation', {
    redis: { host: process.env.REDIS_HOST, port: 6379 },
  });

  codeQueue.on('error', (err) => {
    console.error('Bull queue error:', err);
  });

  console.log('Bull queue initialized successfully!');
} catch (err) {
  console.error('Failed to initialize Bull queue:', err);
  codeQueue = null;
}

module.exports = { codeQueue };