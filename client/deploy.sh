#!/bin/bash

# Eclipser Client Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-production}
BUILD_DIR="dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Invalid environment. Use: development, staging, or production"
    exit 1
fi

# Check if required environment file exists
ENV_FILE=".env.$ENVIRONMENT"
if [[ "$ENVIRONMENT" == "development" ]]; then
    ENV_FILE=".env"
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Environment file $ENV_FILE not found"
    exit 1
fi

echo "✅ Using environment file: $ENV_FILE"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf $BUILD_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build for the specified environment
echo "🏗️ Building application for $ENVIRONMENT..."
if [[ "$ENVIRONMENT" == "development" ]]; then
    npm run build:dev
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    npm run build:staging
else
    npm run build
fi

# Verify build
if [[ ! -d "$BUILD_DIR" ]]; then
    echo "❌ Build failed - $BUILD_DIR directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Create build info file
echo "📋 Creating build info..."
cat > "$BUILD_DIR/build-info.json" << EOF
{
    "environment": "$ENVIRONMENT",
    "buildTime": "$(date -Iseconds)",
    "buildNumber": "$TIMESTAMP",
    "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
    "nodeVersion": "$(node --version)",
    "npmVersion": "$(npm --version)"
}
EOF

# Display build summary
echo "
📊 Build Summary:
- Environment: $ENVIRONMENT
- Build directory: $BUILD_DIR
- Build size: $(du -sh $BUILD_DIR | cut -f1)
- Files: $(find $BUILD_DIR -type f | wc -l)
- Timestamp: $TIMESTAMP
"

# Environment-specific deployment instructions
case $ENVIRONMENT in
    development)
        echo "🔧 Development build complete"
        echo "Run 'npm run preview' to test the build locally"
        ;;
    staging)
        echo "🎭 Staging build complete"
        echo "Deploy to staging server with:"
        echo "rsync -avz --delete $BUILD_DIR/ user@staging-server:/var/www/eclipser/"
        ;;
    production)
        echo "🌟 Production build complete"
        echo "Deploy to production with your preferred method:"
        echo "- Vercel: vercel --prod"
        echo "- Netlify: netlify deploy --prod --dir=$BUILD_DIR"
        echo "- Manual: Upload $BUILD_DIR contents to your web server"
        ;;
esac

echo "✨ Deployment preparation completed!"
