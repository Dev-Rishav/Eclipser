// Startup verification script
require('dotenv').config();

const testSocketService = () => {
  console.log('🧪 Testing Socket Service...');
  const socketService = require('./src/utils/socketService');
  
  // Test before initialization
  console.log('Socket ready before init:', socketService.isReady());
  
  return socketService;
};

const testQueue = () => {
  console.log('🧪 Testing Queue Service...');
  try {
    const { codeQueue } = require('./src/utils/queue');
    if (codeQueue) {
      console.log('✅ Queue initialized successfully');
      return true;
    } else {
      console.log('❌ Queue not initialized');
      return false;
    }
  } catch (error) {
    console.log('❌ Queue error:', error.message);
    return false;
  }
};

const testMongoDB = () => {
  console.log('🧪 Testing MongoDB...');
  try {
    const mongoose = require('mongoose');
    console.log('MongoDB state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.log('❌ MongoDB error:', error.message);
    return false;
  }
};

// Run tests
console.log('🚀 Running startup diagnostics...\n');

const socketService = testSocketService();
const queueReady = testQueue();
const mongoReady = testMongoDB();

console.log('\n📊 Startup Status:');
console.log('Socket Service:', socketService.isReady() ? '✅' : '⚠️');
console.log('Queue Service:', queueReady ? '✅' : '❌');
console.log('MongoDB:', mongoReady ? '✅' : '⚠️ (May connect after server starts)');

if (!queueReady) {
  console.log('\n⚠️  Queue not ready. Make sure Redis is running:');
  console.log('   docker run -d -p 6379:6379 redis:alpine');
  console.log('   or install Redis locally');
}

console.log('\n🎯 Starting server...');
