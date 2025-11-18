#!/bin/bash

# Railway Deployment Setup Script
# This script helps you deploy to Railway

echo "🚂 Pharmacy Management System - Railway Deployment Helper"
echo "=========================================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Installing Railway CLI..."
    npm install -g @railway/cli

    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI"
        echo "Please install manually: npm i -g @railway/cli"
        exit 1
    fi
    echo "✅ Railway CLI installed successfully!"
else
    echo "✅ Railway CLI is already installed"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Login to Railway:"
echo "   railway login"
echo ""
echo "2. Create a new project:"
echo "   railway init"
echo ""
echo "3. Add PostgreSQL database:"
echo "   railway add --database postgres"
echo ""
echo "4. Deploy backend:"
echo "   cd backend"
echo "   railway up"
echo ""
echo "5. Initialize database:"
echo "   railway connect postgres"
echo "   # Then paste the contents of database/schema.sql"
echo ""
echo "6. Set environment variables:"
echo "   railway variables set JWT_SECRET=<your-secret>"
echo "   railway variables set JWT_REFRESH_SECRET=<your-secret>"
echo "   railway variables set CORS_ORIGIN=<your-frontend-url>"
echo ""
echo "7. Deploy frontend (in separate service):"
echo "   cd frontend"
echo "   railway up"
echo ""
echo "📖 For detailed instructions, see: RAILWAY_DEPLOYMENT.md"
echo ""
echo "🌐 Railway Dashboard: https://railway.app/dashboard"
echo ""
