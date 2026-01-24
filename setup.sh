#!/bin/bash

# Installation and Setup Script for Messaging System
# This script installs dependencies and sets up the project

set -e

echo "🚀 Setting up Ecobank Express Messaging System..."
echo "=================================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check key packages
echo "🔍 Verifying key packages..."
npm list socket.io socket.io-client concurrently next react react-dom

echo ""
echo "✅ All required packages are installed!"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local configuration file..."
    cat > .env.local << 'EOF'
# Socket.IO Server Configuration
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Node Environment
NODE_ENV=development

# Server Port
PORT=3001
EOF
    echo "✅ .env.local created with default settings"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Review QUICK_START.md for a quick introduction"
echo "   2. Run: npm run dev:full"
echo "   3. Visit:"
echo "      - Client: http://localhost:3000/client"
echo "      - Admin:  http://localhost:3000/admin"
echo ""
echo "📖 Documentation:"
echo "   - Quick Start: QUICK_START.md"
echo "   - Full Guide: MESSAGING_SYSTEM_GUIDE.md"
echo "   - Deployment: DEPLOYMENT_GUIDE.md"
echo ""
