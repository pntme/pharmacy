# Frontend Deployment Guide

## 🚀 Quick Start - Deploy to Render

Your frontend is now configured and ready to deploy! Follow these steps:

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository: `pntme/pharmacy`
   - Branch: `claude/pharmacy-management-system-01UhnP81hofYxNV2ajMhzLF9` (or `main` after merging)

3. **Configure Build Settings**
   ```
   Name: pharmacy-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

4. **Add Environment Variable**
   - Key: `VITE_API_URL`
   - Value: `https://pharmacy-backend-ayg4.onrender.com/api/v1`

5. **Deploy**
   - Click "Create Static Site"
   - Render will build and deploy your frontend
   - You'll get a URL like: `https://pharmacy-frontend-XXXX.onrender.com`

### Option 2: Deploy Using render.yaml (Infrastructure as Code)

Your project already has `render.yaml` configured!

1. **Push to GitHub**
   ```bash
   git push origin claude/pharmacy-management-system-01UhnP81hofYxNV2ajMhzLF9
   ```

2. **Create Blueprint in Render**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect repository: `pntme/pharmacy`
   - Select branch
   - Render will read `render.yaml` and create both services:
     - `pharmacy-backend` (already running)
     - `pharmacy-frontend` (new)

3. **Deploy**
   - Render automatically deploys based on `render.yaml`

## 🎯 What's Already Configured

Your frontend setup includes:

✅ **Environment Configuration**
- `.env.example` - Template for environment variables
- `.env.development` - Local development (localhost backend)
- `.env` - Production (Render backend) - NOT committed to git

✅ **Render Configuration** (`render.yaml`)
- Static site deployment
- Automatic build: `npm install && npm run build`
- Environment variable: `VITE_API_URL`
- Security headers (X-Frame-Options, X-Content-Type-Options)
- SPA routing (all routes redirect to index.html)

✅ **Frontend Features**
- React 18 + TypeScript
- Material-UI components
- JWT authentication
- API integration with backend
- Responsive design
- Multiple pages: Dashboard, POS, Products, Inventory, Sales, Reports

## 🔧 Local Development

### Run Frontend Locally with Production API

```bash
cd frontend
npm install
npm run dev
```

The frontend will:
- Run on `http://localhost:3000`
- Connect to production API: `https://pharmacy-backend-ayg4.onrender.com/api/v1`

### Run Full Stack Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend will proxy `/api` requests to `http://localhost:3001`

## 🌐 After Deployment

Once deployed, you'll have:

1. **Backend API**: `https://pharmacy-backend-ayg4.onrender.com`
2. **Frontend App**: `https://pharmacy-frontend-XXXX.onrender.com`

### Test Your Deployment

1. Visit your frontend URL
2. You should see the Login page
3. Try logging in with credentials (need to create user first via API)

### Create First User via API

```bash
curl -X POST https://pharmacy-backend-ayg4.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@pharmacy.com",
    "password": "Admin@123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

Then login with:
- Username: `admin`
- Password: `Admin@123`

## 🔒 Important Security Notes

### Environment Variables

**Never commit these files:**
- `frontend/.env` (contains production API URL)
- Any file with secrets or API keys

**Safe to commit:**
- `frontend/.env.example` (template only)
- `frontend/.env.development` (localhost only)

### Production Checklist

Before going live:
- [ ] Change default admin password
- [ ] Set up proper JWT secrets in backend
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Review CORS settings in backend

## 📱 Alternative Hosting Options

### Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Add environment variable in Vercel dashboard:
- `VITE_API_URL` = `https://pharmacy-backend-ayg4.onrender.com/api/v1`

### Netlify

```bash
cd frontend
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Add environment variable in Netlify dashboard:
- `VITE_API_URL` = `https://pharmacy-backend-ayg4.onrender.com/api/v1`

### AWS S3 + CloudFront

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Upload `dist/` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up environment variables before build

## 🐛 Troubleshooting

### Build Fails on Render

**Check build logs for:**
- Node version: Should be >= 18.0.0
- npm install errors: Check network/registry issues
- TypeScript errors: Run `npm run build` locally first

**Solution:**
```bash
# Test build locally
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running: Visit `https://pharmacy-backend-ayg4.onrender.com`
2. CORS is enabled in backend for your frontend domain
3. Environment variable `VITE_API_URL` is set correctly

**Update CORS in backend** (`backend/src/server.ts`):
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://pharmacy-frontend-XXXX.onrender.com', // Add your frontend URL
  ],
  credentials: true,
};
```

### Page Refresh Shows 404

This is normal for SPAs. Render's `render.yaml` is configured with:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

This redirects all routes to `index.html` for client-side routing.

## 📚 Next Steps

1. **Deploy Frontend** using one of the methods above
2. **Test All Features**:
   - Login/Register
   - Dashboard
   - POS (Point of Sale)
   - Products management
   - Inventory tracking
   - Sales reports

3. **Customize**:
   - Add your logo
   - Change color scheme
   - Add more features

4. **Monitor**:
   - Check Render logs
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API performance

## 🤝 Need Help?

- Frontend README: `frontend/README.md`
- Backend API Docs: `https://pharmacy-backend-ayg4.onrender.com/api/v1`
- Render Docs: https://render.com/docs/static-sites

Happy deploying! 🎉
