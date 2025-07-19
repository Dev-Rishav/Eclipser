// Debug script to check environment loading
console.log('=== Environment Debug Info ===');
console.log('NODE_ENV from system:', process.env.NODE_ENV);
console.log('Working directory:', process.cwd());

// Load dotenv with the same logic as server.js
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

console.log('After dotenv.config():');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('File loaded:', process.env.NODE_ENV === 'production' ? '.env.production' : '.env');

// Check if files exist
const fs = require('fs');
console.log('Files in directory:');
console.log('.env exists:', fs.existsSync('.env'));
console.log('.env.production exists:', fs.existsSync('.env.production'));
