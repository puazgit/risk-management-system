# Local Development Setup

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Environment Configuration

### For Local Development

The application uses `.env.local` for local development which connects to a local PostgreSQL database.

#### Database Configuration (`.env.local`)
```env
# Database - Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/risikoapp?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="O22szrvM0eHKJsaN8xIQvyViUPPgWcWaXQEJwwHYqb8="

# App Settings
NODE_ENV="development"
```

### For Production/Cloud

The `.env` file contains production configuration for Prisma Postgres (cloud database).

## Quick Setup

### Option 1: Automated Setup

```bash
# Install dependencies
npm install

# Setup local PostgreSQL database (creates database, user, etc.)
npm run db:local:init

# Start development server
npm run dev
```

### Option 2: Manual Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database & User**
   ```sql
   -- Connect to PostgreSQL
   psql postgres
   
   -- Create user
   CREATE USER postgres WITH PASSWORD 'password' SUPERUSER;
   
   -- Create database
   CREATE DATABASE risikoapp OWNER postgres;
   ```

3. **Setup Application**
   ```bash
   # Install dependencies
   npm install
   
   # Deploy database schema
   npx prisma db push
   
   # Seed with sample data
   npm run db:seed
   
   # Start development server
   npm run dev
   ```

## Environment File Priority

Next.js loads environment variables in this order:
1. `.env.local` (highest priority, ignored by git)
2. `.env.development` (for development)
3. `.env.production` (for production)
4. `.env` (lowest priority)

## Test Credentials

After seeding, you can login with:

```
Email: admin@test.com
Password: admin123

Email: test@test.com
Password: test123

Email: risk@test.com
Password: risk123
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:local:setup` - Setup local PostgreSQL
- `npm run db:local:init` - Complete local setup (DB + schema + seed)
- `npm run db:push` - Deploy schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database and re-seed

## Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check database credentials in `.env.local`

3. Verify database exists:
   ```bash
   psql -h localhost -U postgres -l
   ```

### Port Issues

If port 3000 is busy:
```bash
npm run dev -- --port 3001
```

### Clear Next.js cache

```bash
rm -rf .next
npm run dev
```