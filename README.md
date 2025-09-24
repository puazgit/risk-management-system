# Risk Management System

Aplikasi Manajemen Risiko modern dengan Next.js 15, Prisma, dan PostgreSQL.

## � **Production URL**
- **Live Application**: [https://risikoapp.vercel.app](https://risikoapp.vercel.app)

## ✨ **Auto-Deployment Status: ACTIVE** 
- ✅ GitHub → Vercel integration configured
- ✅ Every push to `main` branch triggers automatic deployment
- ✅ Local development with Docker PostgreSQL
- ✅ Production with Prisma Postgres

## 📊 **Features** Aplikasi Manajemen Risiko

Aplikasi manajemen risiko modern yang dibangun dengan teknologi terdepan untuk membantu organisasi mengelola dan memantau risiko secara efektif.

## 🚀 Fitur Utama

- **🔐 Authentication System**: Sistem autentikasi lengkap dengan NextAuth.js
  - Login/Register dengan email & password
  - Login dengan Google OAuth
  - Forgot password & reset password
  - Session management yang aman

- **📊 Dashboard Management**: Panel kontrol untuk mengelola risiko
- **🎯 Risk Assessment**: Penilaian komprehensif risiko organisasi
- **📈 Risk Monitoring**: Pemantauan real-time dan analisis tren
- **📋 Compliance**: Manajemen kepatuhan dan audit trail

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod Schema Validation
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Pastikan Anda telah menginstall:

- Node.js 18+ 
- npm atau yarn
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd risikoapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/risikoapp"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Start Database

```bash
# Start PostgreSQL dengan Docker
docker-compose up -d

# Atau jika menggunakan Docker Compose v2
docker compose up -d
```

### 5. Database Migration & Seeding

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database dengan sample data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🗃️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create & apply migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Database Seeding

```bash
# Seed all data
npm run db:seed

# Seed specific data
npm run db:seed:users
npm run db:seed:units
# dll...
```

## 📁 Project Structure

```
risikoapp/
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   ├── dashboard/      # Dashboard page
│   │   └── ...
│   ├── components/         # Reusable components
│   │   └── ui/            # Shadcn UI components
│   └── lib/               # Utilities & configurations
├── docker-compose.yml      # Docker services
└── package.json
```

## 🔧 Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:reset        # Reset database
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check
```

## 🔐 Authentication Flow

### 1. Register New User
- Navigate to `/register`
- Fill form dengan nama, email, dan password
- System akan hash password dan simpan ke database
- Redirect ke login page setelah sukses

### 2. Login
- Navigate ke `/login`
- Login dengan email & password atau Google
- Session akan dibuat dan disimpan
- Redirect ke dashboard setelah sukses

### 3. Forgot Password
- Navigate ke `/forgot-password`
- Masukkan email
- System generate reset token dan simpan ke database
- Link reset akan di-log ke console (untuk development)

### 4. Reset Password
- Navigate ke `/reset-password?token=<reset-token>`
- Masukkan password baru
- Token akan divalidasi dan password di-update

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password dengan token

### NextAuth Routes
- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `POST /api/auth/callback/*` - OAuth callbacks

## 🎨 UI Components

Project menggunakan Shadcn UI dengan komponen:

- **Button**: Tombol dengan berbagai variant
- **Card**: Container untuk konten
- **Input**: Input field untuk form
- **Label**: Label untuk form elements
- **Form**: Form handling dengan React Hook Form
- **Toast**: Notifications dengan React Hot Toast

## 🐳 Docker Services

```yaml
# PostgreSQL Database
postgres:
  image: postgres:15
  ports: 5432:5432
  environment:
    - POSTGRES_DB=risikoapp
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=password

# pgAdmin (Database Management)
pgadmin:
  image: dpage/pgadmin4
  ports: 5050:80
  environment:
    - PGADMIN_DEFAULT_EMAIL=admin@admin.com
    - PGADMIN_DEFAULT_PASSWORD=admin
```

### Akses Database
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050` (admin@admin.com / admin)

## 🔍 Development Tips

### 1. Database Schema Changes
```bash
# Setelah mengubah schema.prisma
npx prisma generate
npx prisma migrate dev --name describe-changes
```

### 2. Debugging Authentication
```bash
# Check session
console.log(session) # di client component

# Check database
npx prisma studio # buka Prisma Studio
```

### 3. Form Validation
- Semua form menggunakan Zod schema validation
- Error handling terintegrasi dengan React Hook Form
- Toast notifications untuk feedback user

## 🚀 Deployment

### Coolify (Self-Hosted) - Recommended
Aplikasi ini dikonfigurasi untuk deployment dengan Coolify, platform self-hosted deployment yang powerful.

#### Prerequisites
1. Server dengan Docker dan Coolify terinstall
2. Domain atau subdomain yang sudah di-pointing ke server
3. Repository GitHub/GitLab yang accessible

#### Deployment Steps

1. **Setup Repository di Coolify**
   ```bash
   # Push code ke GitHub terlebih dahulu
   git add .
   git commit -m "Ready for Coolify deployment"
   git push origin main
   ```

2. **Create Service di Coolify**
   - Login ke Coolify dashboard
   - Create new project dan service
   - Connect ke repository GitHub
   - Pilih branch `main`

3. **Environment Variables**
   Configure environment variables di Coolify menggunakan template `.env.coolify`:
   ```env
   DATABASE_URL="postgresql://postgres:password@postgres:5432/risikoapp"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="generate-secure-secret"
   GOOGLE_CLIENT_ID="" # Optional
   GOOGLE_CLIENT_SECRET="" # Optional
   NODE_ENV="production"
   ```

4. **Generate Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

5. **Deploy**
   - Coolify akan otomatis detect Dockerfile dan docker-compose.yml
   - Build process menggunakan multi-stage Docker build
   - Database PostgreSQL akan di-provision otomatis
   - Health check endpoint: `/api/health`

#### Production Configuration
- **Build**: Menggunakan Docker multi-stage build untuk optimasi size
- **Output**: Next.js standalone untuk containerized deployment
- **Database**: PostgreSQL 15 dengan persistent volumes
- **Health Check**: Automated health monitoring di `/api/health`
- **Auto-scaling**: Configured untuk restart otomatis

### Manual Docker Production
Jika ingin deploy manual dengan Docker:

```bash
# Build production image
docker build -t risikoapp .

# Run dengan docker-compose
docker-compose up -d

# Atau run standalone
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  risikoapp
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check dokumentasi ini
2. Search existing issues di GitHub
3. Create new issue dengan detail lengkap
4. Join discussion di GitHub Discussions

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Basic authentication system
- ✅ Register/Login/Forgot Password
- ✅ Database schema untuk risk management
- ✅ Shadcn UI integration
- ✅ Docker setup untuk development
- ✅ Comprehensive seeding system

### Planned Features
- 🔄 Risk assessment workflows
- 🔄 Dashboard dengan metrics
- 🔄 Email notifications
- 🔄 Advanced user roles & permissions
- 🔄 Reporting system
- 🔄 API documentation

---

**Built with ❤️ using Next.js, PostgreSQL, Prisma, NextAuth.js, and Shadcn UI**