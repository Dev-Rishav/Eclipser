const validateEnvVariables = () => {
  const errors = [];
  
  // Required environment variables
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  // Optional with defaults
  const optional = {
    PORT: process.env.DEFAULT_PORT || 3000,
    NODE_ENV: 'development',
    JWT_EXPIRES_IN: '30d',
    CLIENT_URL: 'http://localhost:5173',
    CORS_ORIGIN: 'http://localhost:5173'
  };

  // Redis configuration (at least one should be present)
  const hasRedisUrl = process.env.REDIS_URL;
  const hasRedisHost = process.env.REDIS_HOST;
  
  if (!hasRedisUrl && !hasRedisHost) {
    errors.push('Either REDIS_URL or REDIS_HOST must be provided');
  }

  // Check required variables
  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Set defaults for optional variables
  Object.entries(optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`🔧 Using default for ${key}: ${defaultValue}`);
    }
  });

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 8) {
    console.warn('⚠️  JWT_SECRET is too short. Consider using a longer secret for better security.');
  }

  // Validate NODE_ENV
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
    console.warn(`⚠️  NODE_ENV "${process.env.NODE_ENV}" is not standard. Expected: ${validNodeEnvs.join(', ')}`);
  }

  // Log configuration summary
  console.log('\n🔧 Environment Configuration Summary:');
  console.log(`   📁 Node Environment: ${process.env.NODE_ENV}`);
  console.log(`   🚀 Port: ${process.env.PORT}`);
  console.log(`   🗄️  Database: ${process.env.MONGO_URI?.replace(/\/\/.*@/, '//***:***@') || 'Not configured'}`);
  console.log(`   🔑 JWT Expires: ${process.env.JWT_EXPIRES_IN}`);
  console.log(`   🌐 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`   📡 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log(`   🔴 Redis: ${hasRedisUrl ? 'Cloud Redis URL' : `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`}`);
  console.log(`   ☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'}\n`);

  // Return validation results
  if (errors.length > 0) {
    console.error('❌ Environment Validation Errors:');
    errors.forEach(error => console.error(`   • ${error}`));
    return { valid: false, errors };
  }

  console.log('✅ All environment variables validated successfully!\n');
  return { valid: true, errors: [] };
};

module.exports = validateEnvVariables;
