#!/bin/bash

# Eclipser Production Deployment Script for EC2

echo "🚀 Starting Eclipser in Production Mode"
echo "======================================"

# Stop existing PM2 processes
pm2 stop eclipser 2>/dev/null || echo "No existing process to stop"
pm2 delete eclipser 2>/dev/null || echo "No existing process to delete"

# Ensure we're in the right directory
cd /home/ubuntu/Eclipser/server/main-service || {
    echo "❌ Failed to change to project directory"
    exit 1
}

# Check environment files
if [ ! -f ".env.production" ]; then
    echo "❌ Missing .env.production file"
    exit 1
fi

echo "✅ Environment files found"

# Method 1: Use ecosystem.config.js (Recommended)
if [ -f "ecosystem.config.js" ]; then
    echo "🔧 Starting with ecosystem.config.js..."
    pm2 start ecosystem.config.js --env production
else
    # Method 2: Direct PM2 start with environment
    echo "🔧 Starting with direct PM2 command..."
    NODE_ENV=production pm2 start server.js --name eclipser
fi

# Show status
pm2 status
pm2 logs eclipser --lines 10

echo "✅ Deployment complete!"
echo "To monitor: pm2 monit"
echo "To view logs: pm2 logs eclipser"
