# Pharmacy Management System - Frontend

Modern React-based frontend for the Pharmacy Management System, built with TypeScript, Vite, and Material-UI.

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Recharts** - Data visualization
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── stores/        # Zustand state stores
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── .env               # Environment variables (production)
├── .env.development   # Development environment variables
└── vite.config.ts     # Vite configuration
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**

   For development (local backend):
   ```bash
   # .env.development (already configured)
   VITE_API_URL=http://localhost:3001/api/v1
   ```

   For production:
   ```bash
   # .env
   VITE_API_URL=https://pharmacy-backend-ayg4.onrender.com/api/v1
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

   Production files will be in `dist/` directory

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🔑 Features

### Pages & Modules

1. **Dashboard** (`/`)
   - Overview of key metrics
   - Sales charts and analytics
   - Quick stats

2. **POS (Point of Sale)** (`/pos`)
   - Quick sales interface
   - Product search
   - Invoice generation
   - Payment processing

3. **Products** (`/products`)
   - Product catalog
   - Add/Edit/Delete products
   - Product search and filtering

4. **Inventory** (`/inventory`)
   - Stock management
   - Batch tracking
   - Expiry date monitoring
   - Stock adjustments

5. **Sales** (`/sales`)
   - Sales history
   - Invoice management
   - Sales reports

6. **Patients/Customers** (`/patients`)
   - Customer management
   - Purchase history
   - Contact information

7. **Reports** (`/reports`)
   - Sales reports
   - Inventory reports
   - Financial analytics

8. **Login** (`/login`)
   - User authentication
   - JWT token management

## 🔐 Authentication

The app uses JWT-based authentication:

- **Access Token**: Stored in localStorage, expires in 15 minutes
- **Refresh Token**: Stored in localStorage, used to get new access tokens
- **Auto-refresh**: Automatically refreshes expired tokens
- **Protected Routes**: Redirects to login if not authenticated

### API Service

The `api.ts` service handles all HTTP requests with:
- Automatic token attachment
- Token refresh on 401 errors
- Error handling
- TypeScript types

## 🎨 UI Components

Built with Material-UI for consistent, professional design:

- **Layout**: Responsive sidebar navigation
- **Forms**: Validated input fields
- **Tables**: Sortable, filterable data tables
- **Charts**: Interactive charts with Recharts
- **Modals**: Dialog boxes for forms
- **Toast Notifications**: Success/error feedback

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://pharmacy-backend-ayg4.onrender.com/api/v1` |

## 📦 Build & Deployment

### Render (Recommended)

The frontend is configured in `render.yaml` at the project root:

```yaml
- type: web
  name: pharmacy-frontend
  runtime: static
  buildCommand: cd frontend && npm install && npm run build
  staticPublishPath: frontend/dist
```

**Deploy to Render:**
1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically deploy using `render.yaml`
4. Your frontend will be available at: `https://pharmacy-frontend-XXXX.onrender.com`

### Alternative: Vercel, Netlify, or AWS S3

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Configure environment variables** in your hosting platform:
   - `VITE_API_URL`: Your backend API URL

### Docker Deployment

```bash
# Build Docker image
docker build -t pharmacy-frontend .

# Run container
docker run -p 80:80 pharmacy-frontend
```

## 🧪 Development Tips

### Running with Backend

1. Start backend on port 3001:
   ```bash
   cd backend
   npm run dev
   ```

2. Start frontend on port 3000:
   ```bash
   cd frontend
   npm run dev
   ```

3. The frontend proxy will automatically forward `/api` requests to the backend

### Code Style

```bash
# Run linter
npm run lint
```

### Type Checking

TypeScript is configured with strict mode. Run type check:
```bash
npx tsc --noEmit
```

## 🐛 Troubleshooting

### CORS Issues

If you see CORS errors:
1. Ensure backend has CORS enabled for your frontend origin
2. Check `backend/src/server.ts` CORS configuration

### API Connection Failed

1. Verify `VITE_API_URL` in `.env` file
2. Check backend is running and accessible
3. Open browser DevTools → Network tab to inspect requests

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## 📚 API Endpoints Used

The frontend consumes these backend API endpoints:

- **Auth**: `/api/v1/auth/*`
- **Products**: `/api/v1/products/*`
- **Inventory**: `/api/v1/inventory/*`
- **Sales**: `/api/v1/sales/*`
- **Patients**: `/api/v1/patients/*`
- **Reports**: `/api/v1/reports/*`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linter: `npm run lint`
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
