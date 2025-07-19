#!/bin/bash

# Eclipser Backend Environment Setup Script

echo "🚀 Eclipser Backend Environment Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found: $1${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing: $1${NC}"
        return 1
    fi
}

# Function to create env file from template
create_env_from_template() {
    if [ ! -f "$1" ] && [ -f "$2" ]; then
        echo -e "${YELLOW}🔧 Creating $1 from template...${NC}"
        cp "$2" "$1"
        echo -e "${GREEN}✅ Created $1${NC}"
        echo -e "${YELLOW}⚠️  Please edit $1 with your actual configuration values${NC}"
    fi
}

echo ""
echo "🔍 Checking Environment Files..."
echo "--------------------------------"

# Check main service
echo -e "${BLUE}Main Service:${NC}"
cd server/main-service 2>/dev/null || { echo -e "${RED}❌ Cannot find main-service directory${NC}"; exit 1; }

check_file_exists ".env"
check_file_exists ".env.production.template"
create_env_from_template ".env.production" ".env.production.template"

echo ""
echo -e "${BLUE}Contest Service:${NC}"
cd ../contest-service 2>/dev/null || { echo -e "${YELLOW}⚠️  Contest service not found, skipping...${NC}"; cd ../main-service; }

if [ -d "../contest-service" ]; then
    cd ../contest-service
    check_file_exists ".env"
    check_file_exists ".env.production.template"
    create_env_from_template ".env.production" ".env.production.template"
fi

echo ""
echo "🔧 Environment Variables Check..."
echo "--------------------------------"

cd ../main-service

# Check if required tools are available
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Node.js is installed${NC}"
    node --version
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    echo -e "${GREEN}✅ NPM is installed${NC}"
else
    echo -e "${RED}❌ NPM is not installed${NC}"
    exit 1
fi

echo ""
echo "📦 Installing Dependencies..."
echo "----------------------------"

# Install main service dependencies
echo -e "${BLUE}Installing main service dependencies...${NC}"
npm install

# Install contest service dependencies if it exists
if [ -d "../contest-service" ]; then
    echo -e "${BLUE}Installing contest service dependencies...${NC}"
    cd ../contest-service
    npm install
    cd ../main-service
fi

echo ""
echo "🧪 Testing Environment Configuration..."
echo "--------------------------------------"

# Test environment loading
if node -e "
require('dotenv').config();
const validateEnv = require('./utils/validateEnv');
const result = validateEnv();
process.exit(result.valid ? 0 : 1);
" 2>/dev/null; then
    echo -e "${GREEN}✅ Environment configuration is valid${NC}"
else
    echo -e "${RED}❌ Environment configuration has errors${NC}"
    echo -e "${YELLOW}💡 Please check your .env file and fix the issues${NC}"
fi

echo ""
echo "🏁 Setup Complete!"
echo "=================="
echo -e "${GREEN}✅ Backend environment setup completed${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env files with your actual configuration values"
echo "2. Ensure MongoDB and Redis are running"
echo "3. Run 'npm start' to start the main service"
echo "4. Run 'npm start' in contest-service directory (if needed)"
echo ""
echo "📚 For detailed configuration help, see: server/ENVIRONMENT_SETUP.md"
