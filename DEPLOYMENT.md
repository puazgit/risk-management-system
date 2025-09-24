# Coolify Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Repository Preparation
- [x] Remove Vercel configuration (vercel.json deleted)
- [x] Create production Dockerfile 
- [x] Update next.config.js with standalone output
- [x] Create .dockerignore for optimized builds
- [x] Update docker-compose.yml for production
- [x] Create environment template (.env.coolify)
- [x] Health check endpoint available at /api/health

### 2. Environment Configuration
- [ ] Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Set production NEXTAUTH_URL to your Coolify domain
- [ ] Configure DATABASE_URL for production PostgreSQL
- [ ] Set NODE_ENV=production
- [ ] Configure optional Google OAuth credentials

### 3. Coolify Server Setup
- [ ] Coolify installed and running on server
- [ ] Domain/subdomain configured and pointing to server
- [ ] SSL certificate configured (Let's Encrypt recommended)
- [ ] Docker and Docker Compose available

## 🚀 Deployment Process

### 1. Repository Connection
- [ ] Push all changes to GitHub main branch
- [ ] Connect repository in Coolify dashboard
- [ ] Configure auto-deployment from main branch
- [ ] Set correct build context (root directory)

### 2. Service Configuration
- [ ] Create new service in Coolify project
- [ ] Select Docker Compose deployment type
- [ ] Configure custom domain if needed
- [ ] Set up environment variables from template

### 3. Database Setup
- [ ] PostgreSQL service will be auto-created
- [ ] Verify database connectivity in health check
- [ ] Run Prisma migrations on first deployment
- [ ] Seed initial data if needed

### 4. Deployment Verification
- [ ] Build completes successfully
- [ ] All containers start and remain healthy
- [ ] Health check endpoint returns healthy status
- [ ] Application accessible via configured domain
- [ ] Authentication flow works correctly
- [ ] Database operations functional

## 🔧 Post-Deployment Tasks

### 1. Database Management
```bash
# Access running container for database operations
docker exec -it risikoapp_app_1 npm run db:migrate
docker exec -it risikoapp_app_1 npm run db:seed
```

### 2. Monitoring Setup
- [ ] Configure Coolify monitoring and alerting
- [ ] Set up log aggregation if needed
- [ ] Monitor resource usage and performance
- [ ] Set up backup strategy for database

### 3. Security Hardening
- [ ] Review and rotate secrets regularly
- [ ] Configure firewall rules if needed
- [ ] Enable rate limiting on reverse proxy
- [ ] Set up security headers

## 🛠️ Troubleshooting

### Common Issues
1. **Build Failures**
   - Check Dockerfile syntax
   - Verify all dependencies in package.json
   - Review build logs in Coolify

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check PostgreSQL service health
   - Ensure network connectivity between services

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches domain
   - Review NextAuth configuration

### Debug Commands
```bash
# Check container logs
docker logs risikoapp_app_1

# Access container shell
docker exec -it risikoapp_app_1 /bin/sh

# Check health status
curl https://your-domain.com/api/health
```

## 📝 Migration Notes

### From Vercel to Coolify
- **Removed**: vercel.json configuration
- **Added**: Dockerfile for containerized deployment
- **Updated**: next.config.js with standalone output
- **Changed**: Deployment process from serverless to containerized
- **Benefits**: Full control, cost predictability, self-hosted infrastructure

### Key Differences
- **Build Process**: Docker multi-stage vs Vercel serverless
- **Database**: Self-managed PostgreSQL vs Vercel Postgres
- **Environment**: Container-based vs serverless functions
- **Scaling**: Manual/configured vs automatic serverless scaling

---

## 📞 Support

If you encounter issues during Coolify deployment:
1. Check Coolify documentation
2. Review container logs in Coolify dashboard
3. Test health check endpoint
4. Verify environment variables configuration
5. Check GitHub repository issues