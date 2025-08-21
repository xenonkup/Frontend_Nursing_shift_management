# 🚀 Frontend Deployment Guide

## 📋 Overview
This guide covers deploying the Nursing Shift Management Frontend to Vercel.

## 🔧 Prerequisites
- Backend API deployed and accessible
- Vercel account
- Git repository connected to Vercel

## 🌐 Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-backend-app.vercel.app/api
```

## 🚀 Deployment Steps

### 1. Prepare Repository
```bash
git add .
git commit -m "🚀 Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_API_BASE_URL`
5. Deploy

### 3. Verify Deployment
- Check that the app loads correctly
- Test authentication flow
- Verify API connections
- Test all major features

## 🔗 Post-Deployment
- Update backend CORS settings to include your frontend domain
- Test all API endpoints
- Monitor for any errors in Vercel logs

## 🛠️ Troubleshooting
- Check Vercel build logs for errors
- Verify environment variables are set correctly
- Ensure backend API is accessible from Vercel
- Check CORS configuration on backend