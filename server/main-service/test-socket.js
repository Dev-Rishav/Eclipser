/**
 * Simple test to verify socket connection and messaging
 */

const io = require('socket.io-client');

const socket = io('http://localhost:8000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Register as a test user
  socket.emit('register', 'test-user-123');
});

socket.on('private_message', (message) => {
  console.log('📨 Received message:', message);
});

socket.on('message_sent', (ack) => {
  console.log('✅ Message acknowledged:', ack);
});

socket.on('user_online', (data) => {
  console.log('🟢 User online:', data);
});

socket.on('user_offline', (data) => {
  console.log('⚫ User offline:', data);
});

socket.on('typing', (data) => {
  console.log('⌨️ User typing:', data);
});

socket.on('stop_typing', (data) => {
  console.log('⏹️ User stopped typing:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Test sending a message after 3 seconds
setTimeout(() => {
  console.log('📤 Sending test message...');
  socket.emit('private_message', {
    sender: 'test-user-123',
    receiver: 'test-user-456',
    content: 'Hello, this is a test message!',
    timestamp: new Date().toISOString(),
    senderName: 'Test User'
  });
}, 3000);

console.log('🚀 Socket test client started...');
