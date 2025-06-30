// Test script to verify Socket.IO initialization
const socketService = require('./src/utils/socketService');

console.log('🧪 Testing Socket.IO service...');

// Test before initialization
console.log('Is ready before init:', socketService.isReady());

// Simulate initialization (this would normally be done by the main server)
const mockIO = {
  to: (room) => ({
    emit: (event, data) => {
      console.log(`Mock emit to room '${room}': ${event}`, data);
    }
  }),
  emit: (event, data) => {
    console.log(`Mock emit to all: ${event}`, data);
  }
};

// Initialize the service
socketService.init(mockIO);
console.log('Is ready after init:', socketService.isReady());

// Test emitting
socketService.emitSubmissionUpdate({
  submissionId: 'test123',
  contestId: 'contest456',
  userId: 'user789',
  status: 'completed',
  result: { status: 'accepted' }
});

console.log('✅ Socket service test completed');
