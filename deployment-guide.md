# 🚀 AI Contract Review Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create these environment variables for production:

#### Backend Environment Variables:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/contract_review
SECRET_KEY=your_super_secure_jwt_secret_key_here_minimum_32_characters

# Optional (with defaults)
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.1
MONGODB_DATABASE=contract_review
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

#### Frontend Environment Variables:
```bash
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

## 🎯 Deployment Options

### Option 1: Vercel + Railway + MongoDB Atlas (Recommended)

#### Frontend: Vercel
1. **Push code to GitHub**
2. **Connect Vercel to GitHub**
3. **Set environment variables**
4. **Deploy automatically**

#### Backend: Railway
1. **Push code to GitHub**
2. **Connect Railway to GitHub**
3. **Set environment variables**
4. **Deploy automatically**

#### Database: MongoDB Atlas
1. **Create free cluster**
2. **Get connection string**
3. **Configure access**

### Option 2: Netlify + Render + MongoDB Atlas

#### Frontend: Netlify
- Free tier: 100GB bandwidth/month
- Automatic deployments
- Form handling

#### Backend: Render
- Free tier: 750 hours/month
- Automatic deployments
- Environment variables

## 📝 Step-by-Step Instructions

### Step 1: Prepare MongoDB Atlas

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create free account**
3. **Create new cluster** (choose free tier)
4. **Create database user**
5. **Whitelist IP addresses** (0.0.0.0/0 for all)
6. **Get connection string**

### Step 2: Deploy Backend to Railway

1. **Go to [Railway](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Connect GitHub repository**
5. **Set environment variables**
6. **Deploy**

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up with GitHub**
3. **Import project**
4. **Set environment variables**
5. **Deploy**

### Step 4: Configure CORS

Update backend CORS settings to include your frontend domain.

## 🔧 Production Optimizations

### Backend Optimizations:
- Enable gzip compression
- Set up proper logging
- Configure rate limiting
- Set up monitoring

### Frontend Optimizations:
- Enable code splitting
- Optimize images
- Set up CDN
- Configure caching

## 🚨 Important Considerations

### Security:
- Use strong SECRET_KEY
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting

### Performance:
- Monitor API usage
- Optimize database queries
- Use CDN for static assets
- Enable caching

### Monitoring:
- Set up error tracking
- Monitor API performance
- Track user analytics
- Set up alerts

## 💰 Cost Breakdown (Free Tiers)

- **Vercel**: $0/month (unlimited static sites)
- **Railway**: $0/month (with $5 credit)
- **MongoDB Atlas**: $0/month (512MB storage)
- **Total**: $0/month

## 🔄 CI/CD Pipeline

Both Vercel and Railway support automatic deployments:
- Push to main branch → Automatic deployment
- Environment variables managed in dashboard
- Rollback capabilities
- Preview deployments for PRs

## 📞 Support

If you encounter issues:
1. Check logs in respective platforms
2. Verify environment variables
3. Test API endpoints
4. Check CORS configuration
