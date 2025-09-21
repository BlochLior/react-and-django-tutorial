# Deployment Guide

This document provides comprehensive instructions for deploying the React + Django Polling App to production using free-tier cloud services.

## Architecture Overview

```
React Frontend (Vercel) → Django Backend (Render) → MySQL Database (Railway)
```

## Prerequisites

- GitHub repository with the polling app code
- Accounts on the following platforms:
  - [Render](https://render.com) (Backend hosting)
  - [Vercel](https://vercel.com) (Frontend hosting)
  - [Railway](https://railway.app) (Database hosting)

## 1. Database Setup (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up for a free account (GitHub login recommended)
3. Verify email if required

### Step 2: Create MySQL Database
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait for database creation (1-2 minutes)

### Step 3: Get Connection Details
1. Click on your MySQL service
2. Go to "Connect" tab
3. Note the connection details:
   - Host: `containers-us-west-xyz.railway.app`
   - Port: `3306`
   - Database: `railway`
   - User: `root`
   - Password: `[generated password]`

### Step 4: Format Database URL
```bash
DATABASE_URL=mysql://root:your_password@containers-us-west-xyz.railway.app:3306/railway
```

## 2. Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up for a free account (GitHub login recommended)
3. Connect your GitHub repository

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `react-and-django-tutorial` (or your preferred name)
   - **Runtime**: Python 3
   - **Build Command**: `cd backend-django && uv sync --no-dev`
   - **Start Command**: `cd backend-django && uv run gunicorn mysite.wsgi:application --bind 0.0.0.0:$PORT`
- Note: also possible to set the base directory as backend-django, `cd` section not required. 
### Step 3: Environment Variables
Set the following environment variables in Render:

```bash
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com

# Database (Railway)
DATABASE_URL=mysql://root:your_password@containers-us-west-xyz.railway.app:3306/railway

# CORS (will be updated after frontend deployment)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Step 4: Generate Secret Key
Generate a new Django secret key:
```bash
cd backend-django
python manage.py shell
>>> from django.core.management.utils import get_random_secret_key
>>> get_random_secret_key()
```
- Note: also possible to generate a key from tools such as `https://djecrety.ir/`
### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

## 3. Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up for a free account (GitHub login recommended)

### Step 2: Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Environment Variables
Set the following environment variable in Vercel:

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://your-backend-name.onrender.com
```

**Important**: The environment variable name must match your `apiService.js` configuration.

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Note your frontend URL: `https://your-frontend-name.vercel.app`

## 4. Connect Frontend and Backend

### Step 1: Update Backend CORS
In your Render dashboard:
1. Go to Environment tab
2. Update `CORS_ALLOWED_ORIGINS`:
   ```bash
   CORS_ALLOWED_ORIGINS=https://your-frontend-name.vercel.app
   ```
3. Save (triggers automatic redeploy)

### Step 2: Test Full Stack
1. Visit your Vercel frontend URL
2. Test poll functionality
3. Verify API calls work

## 5. Environment Variables Reference

### Backend (Render)
| Variable | Value | Description |
|----------|-------|-------------|
| `SECRET_KEY` | Generated key | Django secret key |
| `DEBUG` | `False` | Production mode |
| `ALLOWED_HOSTS` | `your-app.onrender.com` | Allowed hosts |
| `DATABASE_URL` | Railway connection string | Database connection |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | CORS origins |

### Frontend (Vercel)
| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_BASE_URL` | `https://your-backend.onrender.com` | API base URL |

## 6. Troubleshooting

### Common Issues

#### Backend: DisallowedHost Error
```
Invalid HTTP_HOST header: 'your-app.onrender.com'. You may need to add 'your-app.onrender.com' to ALLOWED_HOSTS.
```
**Solution**: Add your Render URL to `ALLOWED_HOSTS` environment variable.

#### Backend: Database Connection Error
```
(2002, "Can't connect to server on 'host' (115)")
```
**Solutions**:
- Verify `DATABASE_URL` format
- Check Railway database is active
- Ensure URL encoding for special characters in passwords

#### Frontend: Network Error / CORS Error
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```
**Solutions**:
- Check environment variable name matches code (`REACT_APP_API_BASE_URL`)
- Verify CORS configuration in backend
- Ensure frontend is making requests to correct backend URL

#### Frontend: Still Accessing Localhost
**Cause**: Environment variable name mismatch
**Solution**: Ensure Vercel environment variable name matches `apiService.js`:
```javascript
// In apiService.js
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
```

### Testing Commands

#### Test Backend API
```bash
curl https://your-backend.onrender.com/polls/
```

#### Test CORS
```bash
curl -H "Origin: https://your-frontend.vercel.app" https://your-backend.onrender.com/polls/
```

## 7. Cost Breakdown

| Service | Cost | Limits |
|---------|------|--------|
| Railway Database | $0/month | 1GB storage |
| Render Backend | $0/month | 750 hours/month |
| Vercel Frontend | $0/month | 100GB bandwidth/month |
| **Total** | **$0/month** | - |

## 8. Scaling Considerations

### When to Upgrade
- Database exceeds 1GB (Railway)
- Backend cold starts become problematic (Render)
- Frontend bandwidth exceeds 100GB/month (Vercel)

### Upgrade Options
- **Railway**: Paid plans start at $5/month
- **Render**: Hobby plan $7/month (no cold starts)
- **Vercel**: Pro plan $20/month (unlimited bandwidth)

## 9. Security Best Practices

- ✅ Use environment variables for all secrets
- ✅ Set `DEBUG=False` in production
- ✅ Configure specific `ALLOWED_HOSTS`
- ✅ Use HTTPS (automatic with all services)
- ✅ Regularly update dependencies
- ✅ Monitor logs for errors

## 10. Maintenance

### Regular Tasks
- Monitor application logs
- Check database storage usage
- Update dependencies periodically
- Review error logs
- Backup important data

### Monitoring
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics and function logs
- **Railway**: Database metrics and logs

---

## Quick Reference

### URLs After Deployment
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/polls/`
- **Admin**: `https://your-backend.onrender.com/admin/`

### Key Files
- **Backend Settings**: `backend-django/mysite/settings.py`
- **Frontend API Config**: `frontend-react/src/services/apiService.js`
- **Environment Variables**: Platform dashboards

### Support
- **Render**: [docs.render.com](https://docs.render.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
