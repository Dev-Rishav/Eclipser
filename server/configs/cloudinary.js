const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');

// Load environment variables with validation
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

// Validate required Cloudinary configuration
const requiredCredentials = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const credential of requiredCredentials) {
  if (!process.env[credential]) {
    throw new Error(`Missing Cloudinary ${credential} in environment variables`);
  }
}

// Configure Cloudinary with enhanced security
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
  api_proxy: process.env.CLOUDINARY_PROXY // Optional proxy support
});

// Verify Cloudinary connection (optional but recommended)
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connection verified'))
  .catch((err) => {
    console.error('❌ Cloudinary configuration error:', err);
    process.exit(1);
  });

module.exports = cloudinary;