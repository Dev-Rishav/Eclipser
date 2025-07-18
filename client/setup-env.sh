#!/bin/bash

# Eclipser Client Environment Setup Script
# This script helps set up environment files for different environments

set -e

echo "🌟 Eclipser Client Environment Setup"
echo "======================================"

# Function to copy and setup environment file
setup_env() {
    local env_name=$1
    local example_file=".env.${env_name}.example"
    local target_file=".env"
    
    if [[ "$env_name" != "development" ]]; then
        target_file=".env.${env_name}"
    fi
    
    if [[ -f "$target_file" ]]; then
        echo "⚠️  $target_file already exists. Backup will be created."
        cp "$target_file" "${target_file}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    if [[ -f "$example_file" ]]; then
        cp "$example_file" "$target_file"
        echo "✅ Created $target_file from $example_file"
        echo "📝 Please edit $target_file with your actual values"
    else
        echo "❌ $example_file not found"
        return 1
    fi
}

# Main menu
echo "Select environment to setup:"
echo "1) Development (.env)"
echo "2) Staging (.env.staging)"  
echo "3) Production (.env.production)"
echo "4) All environments"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        setup_env "development"
        ;;
    2)
        setup_env "staging"
        ;;
    3)
        setup_env "production"
        ;;
    4)
        echo "Setting up all environments..."
        setup_env "development"
        setup_env "staging" 
        setup_env "production"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the created .env file(s) with your actual values"
echo "2. Never commit .env files to git (they're in .gitignore)"
echo "3. Use npm run dev for development"
echo "4. Use npm run build for production"
echo ""
echo "🔒 Security reminder:"
echo "- Keep your API keys and secrets safe"
echo "- Use different values for each environment"
echo "- Never share production secrets"
