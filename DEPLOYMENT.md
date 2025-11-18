# Deployment Guide - Pharmacy Management System

## Table of Contents
1. [Docker Deployment (Recommended)](#docker-deployment)
2. [Manual Deployment](#manual-deployment)
3. [Production Checklist](#production-checklist)
4. [Environment Variables](#environment-variables)

## Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd pharmacy
```

2. **Configure environment**
```bash
# Backend configuration is in docker-compose.yml
# Update database credentials if needed
```

3. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 3000

4. **Initialize database** (first time only)
```bash
# The schema is automatically loaded on first run
# Check logs to ensure successful initialization
docker-compose logs postgres
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- API Health: http://localhost:3001/api/v1/health

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️  This deletes all data!)
docker-compose down -v

# Rebuild containers after code changes
docker-compose up -d --build

# Access backend shell
docker exec -it pharmacy_backend sh

# Access database
docker exec -it pharmacy_db psql -U postgres -d pharmacy_db
```

## Manual Deployment

### 1. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL 14+
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
\q
```

```bash
# Run schema
psql -U pharmacy_user -d pharmacy_db -f database/schema.sql
```

### 2. Backend Deployment

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Update with your configuration

# Build
npm run build

# Start with PM2 (recommended for production)
npm install -g pm2
pm2 start dist/server.js --name pharmacy-api

# Or start with node
node dist/server.js
```

### 3. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or any static server
# Copy dist/ folder to your web server
```

#### Nginx Configuration for Frontend

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pharmacy/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban for SSH protection
- [ ] Enable database encryption at rest
- [ ] Configure backup encryption

### Environment Variables

- [ ] Set `NODE_ENV=production`
- [ ] Update `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure database credentials
- [ ] Set proper `CORS_ORIGIN`
- [ ] Configure email/SMS services

### Database

- [ ] Set up automated backups (daily)
- [ ] Configure point-in-time recovery
- [ ] Set up monitoring and alerts
- [ ] Tune PostgreSQL performance settings
- [ ] Set up database replication (if needed)

### Application

- [ ] Set up process manager (PM2, systemd)
- [ ] Configure log rotation
- [ ] Set up monitoring (New Relic, Datadog, etc.)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Load testing

### Compliance

- [ ] Ensure HIPAA compliance if handling patient data
- [ ] Set up audit logging
- [ ] Configure data retention policies
- [ ] Document security procedures
- [ ] Set up access controls

## Environment Variables

### Backend (.env)

```env
# Required
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=pharmacy_db
DB_USER=pharmacy_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_very_secure_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_secure_refresh_secret

# Optional but recommended
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple backend instances
- Use session store (Redis) for stateless scaling

### Database Scaling
- Set up read replicas for read-heavy workloads
- Consider connection pooling (PgBouncer)
- Implement caching (Redis)

### Monitoring
- Set up Prometheus + Grafana
- Configure alerts for:
  - High CPU/Memory usage
  - Database connection errors
  - API response time > 1s
  - Error rate > 1%

## Backup Strategy

### Database Backups
```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR="/var/backups/pharmacy"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U pharmacy_user pharmacy_db | gzip > $BACKUP_DIR/pharmacy_db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```
0 2 * * * /path/to/backup-script.sh
```

### Application Backups
- Backup uploads folder regularly
- Store backups in remote location (S3, etc.)
- Test restore procedures monthly

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs pharmacy-api

# Check if database is accessible
psql -U pharmacy_user -d pharmacy_db -c "SELECT 1;"

# Check environment variables
pm2 env 0
```

### Database connection errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### High memory usage
```bash
# Check Node.js memory
pm2 list
pm2 monit

# Restart if needed
pm2 restart pharmacy-api
```

## Support

For deployment issues:
1. Check logs first
2. Review this deployment guide
3. Check GitHub issues
4. Contact support

---

**Last Updated:** 2025-01-18
