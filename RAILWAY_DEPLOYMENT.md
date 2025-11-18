# Railway Deployment Guide 🚂

Complete guide to deploy your Pharmacy Management System on Railway.

## Prerequisites

- GitHub account with this repository
- Railway account (sign up at https://railway.app)
- Git installed locally

## 🚀 Quick Deploy (Recommended)

### Step 1: Push to GitHub

If you haven't already pushed to GitHub:

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy Backend + Database

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select this repository
4. Railway will detect it's a Node.js project

**Configure Backend Service:**

1. Click on the deployed service
2. Go to "Settings" → "Service Name" → Rename to "pharmacy-backend"
3. Go to "Settings" → "Root Directory" → Set to `backend`
4. Go to "Variables" and add:

```env
NODE_ENV=production
PORT=3001
API_VERSION=v1

# These will be auto-filled after adding PostgreSQL
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Generate secure secrets (use https://generate-secret.vercel.app/32)
JWT_SECRET=your_generated_secret_here_minimum_32_chars
JWT_REFRESH_SECRET=your_generated_refresh_secret_here

# Set to your frontend domain (will update after frontend deployment)
CORS_ORIGIN=https://your-frontend-url.up.railway.app

# Optional settings
LOG_LEVEL=info
BCRYPT_ROUNDS=10
```

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will create a PostgreSQL database and link it automatically
3. The backend will now have access to database variables

### Step 4: Initialize Database

1. Connect to your Railway PostgreSQL:
   - Go to PostgreSQL service → "Data" tab
   - Click "Connect" to get connection details

2. Option A - Using Railway CLI:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to database
railway connect postgres

# Run schema (copy-paste the content of database/schema.sql)
```

3. Option B - Using psql locally:
```bash
# Get DATABASE_URL from Railway PostgreSQL service
# Go to Variables tab and copy POSTGRES_URL

# Connect and run schema
psql "postgresql://user:pass@host:port/railway" < database/schema.sql
```

### Step 5: Deploy Frontend

1. In Railway project, click "New" → "GitHub Repo" → Select same repository
2. Configure frontend service:
   - **Service Name:** pharmacy-frontend
   - **Root Directory:** frontend
   - Go to "Settings" → "Networking" → "Generate Domain"

3. Add environment variables:
```env
VITE_API_URL=https://your-backend-url.up.railway.app/api/v1
```

### Step 6: Update Backend CORS

1. Go back to backend service
2. Update `CORS_ORIGIN` variable with your frontend URL:
```env
CORS_ORIGIN=https://your-frontend-url.up.railway.app
```

3. Redeploy backend (Railway will auto-redeploy on variable change)

### Step 7: Access Your Application

Your pharmacy system is now live! 🎉

- **Frontend:** https://your-frontend-url.up.railway.app
- **Backend API:** https://your-backend-url.up.railway.app/api/v1
- **Health Check:** https://your-backend-url.up.railway.app/api/v1/health

## 🔐 Create First User

Use the API to create your first admin user:

```bash
curl -X POST https://your-backend-url.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "ChangeThisPassword123!",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@pharmacy.com",
    "role_id": 1
  }'
```

Then login at your frontend URL with these credentials.

## 📊 Railway Dashboard Features

### Monitoring
- View logs in real-time
- Check resource usage (CPU, Memory, Network)
- Monitor database connections

### Deployments
- Auto-deploy on git push (if enabled)
- Rollback to previous deployments
- View deployment history

### Scaling
- Upgrade to paid plan for:
  - More resources
  - Custom domains
  - Better performance
  - Higher limits

## 💰 Railway Pricing (as of 2025)

**Free Tier:**
- $5 of free usage per month
- Perfect for demos and testing
- Automatic sleep after inactivity
- Shared resources

**Hobby Plan ($5/month):**
- $5 free credit + pay for usage
- No sleep
- Better performance
- Custom domains

**Pro Plan ($20/month):**
- $20 free credit + pay for usage
- Priority support
- Higher limits
- Team features

## 🛠 Useful Railway CLI Commands

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open in browser
railway open

# Run commands in Railway environment
railway run npm run migrate

# Get environment variables
railway variables

# Connect to PostgreSQL
railway connect postgres
```

## 🔧 Troubleshooting

### Backend Not Starting

1. **Check Logs:**
   ```bash
   railway logs --service pharmacy-backend
   ```

2. **Common Issues:**
   - Missing environment variables
   - Database not connected
   - Build failed (check Node version)

### Database Connection Issues

1. **Verify Database Variables:**
   - Go to PostgreSQL service → Variables
   - Check all POSTGRES_* variables exist

2. **Test Connection:**
   ```bash
   railway connect postgres
   # If this works, connection is fine
   ```

### Frontend Not Loading

1. **Check Build Logs:**
   - View deployment logs in Railway dashboard
   - Look for build errors

2. **Verify API URL:**
   - Check `VITE_API_URL` is set correctly
   - Must point to backend Railway URL

### CORS Errors

Update backend `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://your-frontend-url.up.railway.app
```

## 🚀 Automatic Deployments

Enable auto-deploy on git push:

1. Go to Backend Service → Settings
2. Under "Deploy Triggers"
3. Enable "Deploy on push to main"

Now every git push will auto-deploy! 🎉

## 🌐 Custom Domain (Pro Plan)

1. Go to service → Settings → Networking
2. Click "Custom Domains"
3. Add your domain (e.g., pharmacy.yourdomain.com)
4. Update DNS records as shown

## 📦 Database Backups

Railway Pro includes automatic backups. For free tier:

1. **Manual Backup:**
   ```bash
   railway connect postgres
   pg_dump > backup.sql
   ```

2. **Scheduled Backups:**
   - Use GitHub Actions
   - Set up cron job
   - Store in S3/cloud storage

## 🔒 Security Checklist

- [ ] Change default admin password immediately
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable Railway's IP allowlist (Pro feature)
- [ ] Set up database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for all secrets

## 📈 Monitoring & Alerts

### Railway Built-in:
- Resource usage graphs
- Deployment status
- Error tracking

### External Tools:
- **Uptime Robot:** Monitor uptime (free)
- **Sentry:** Error tracking (has free tier)
- **Better Stack:** Log management

## 🎓 Best Practices

1. **Environment Variables:**
   - Never commit secrets
   - Use Railway's built-in variables
   - Document all required variables

2. **Database:**
   - Regular backups
   - Monitor connection pool
   - Use connection limits

3. **Deployments:**
   - Test locally first
   - Use staging environment
   - Monitor after deployment

4. **Logs:**
   - Check logs regularly
   - Set up error alerts
   - Archive important logs

## 💡 Tips & Tricks

1. **Faster Builds:**
   - Railway caches `node_modules`
   - Use `npm ci` instead of `npm install`

2. **Database Migrations:**
   - Run migrations before deploying
   - Use Railway CLI for database access

3. **Cost Optimization:**
   - Free tier is enough for demos
   - Monitor usage in dashboard
   - Scale up only when needed

4. **Development:**
   - Use Railway for staging
   - Keep production separate
   - Use different branches

## 🆘 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **GitHub Issues:** Create issue in this repo
- **Railway Support:** support@railway.app (Pro plans)

## 📝 Quick Reference

### Important URLs
- Railway Dashboard: https://railway.app/dashboard
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Status: https://status.railway.app

### Service Configuration
```yaml
Backend:
  Root Directory: backend
  Build Command: npm run build
  Start Command: node dist/server.js
  Port: 3001

Frontend:
  Root Directory: frontend
  Build Command: npm run build
  Start Command: npm run preview
  Port: 4173 (Vite preview)

Database:
  Type: PostgreSQL 14+
  Auto-scaling: Yes
  Backups: Pro feature
```

---

## 🎉 Your Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Deploy backend from GitHub
- [ ] Add PostgreSQL database
- [ ] Configure backend environment variables
- [ ] Initialize database schema
- [ ] Deploy frontend from GitHub
- [ ] Configure frontend environment variables
- [ ] Update backend CORS settings
- [ ] Create first admin user
- [ ] Test login and basic features
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Document your deployment

---

**That's it! Your Pharmacy Management System is now running on Railway! 🚀**

Built with ❤️ for easy deployment!
