#!/bin/bash

echo "🎨 Starting Artist & Album Manager - Frontend"
echo "================================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "📍 Frontend will be available at: http://localhost:4200"
echo "📍 Backend API should be at: http://localhost:8080"
echo ""
echo "🔐 Default credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
