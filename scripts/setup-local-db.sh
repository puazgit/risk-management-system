#!/bin/bash

echo "🗄️ Setting up local PostgreSQL database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first:"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🚀 Starting PostgreSQL service..."
    # macOS
    if command -v brew &> /dev/null; then
        brew services start postgresql@15 || brew services start postgresql
    # Linux
    else
        sudo systemctl start postgresql
    fi
fi

# Create database and user
echo "📊 Creating database and user..."
psql postgres << EOF
-- Drop database if exists
DROP DATABASE IF EXISTS risikoapp;

-- Drop user if exists
DROP USER IF EXISTS postgres;

-- Create user
CREATE USER postgres WITH PASSWORD 'password' SUPERUSER;

-- Create database
CREATE DATABASE risikoapp OWNER postgres;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE risikoapp TO postgres;

\q
EOF

echo "✅ Local PostgreSQL setup completed!"
echo ""
echo "📋 Database Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: risikoapp"
echo "   Username: postgres"
echo "   Password: password"
echo ""
echo "🔄 Next steps:"
echo "   1. Run: npx prisma db push"
echo "   2. Run: npm run db:seed"
echo "   3. Run: npm run dev"