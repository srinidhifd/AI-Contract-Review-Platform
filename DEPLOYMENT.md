# 🚀 AI Contract Review Platform - Deployment Guide

## 📋 Quick Start (5 Minutes)

### 1. **MongoDB Atlas Setup** (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (choose free tier)
4. Create database user
5. Whitelist IP addresses (0.0.0.0/0 for all)
6. Get connection string

### 2. **Backend Deployment** (Railway - Free)
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect your GitHub repository
5. Set environment variables (see below)
6. Deploy automatically

### 3. **Frontend Deployment** (Vercel - Free)
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Import your project
4. Set environment variables (see below)
5. Deploy automatically

---

## 🔧 Environment Variables

### Backend (Railway)
```bash
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/contract_review
SECRET_KEY=your_super_secure_jwt_secret_key_here_minimum_32_characters
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

---

## 📝 Detailed Steps

### Step 1: Prepare Your Code

1. **Make sure your code is in GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Run the setup script** (optional)
   ```bash
   chmod +x setup-env.sh
   ./setup-env.sh
   ```

### Step 2: MongoDB Atlas Setup

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up with email or GitHub

2. **Create Cluster**
   - Click "Create Cluster"
   - Choose "Free" tier
   - Select region closest to you
   - Name your cluster (e.g., "contract-review")

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New User"
   - Choose "Password" authentication
   - Create username and password
   - Give "Read and write to any database" permissions

4. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 3: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure Project**
   - Railway will auto-detect it's a Python project
   - It will use the `Procfile` we created

4. **Set Environment Variables**
   - Go to "Variables" tab
   - Add all backend environment variables (see above)

5. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://your-app.railway.app`)

### Step 4: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Choose "frontend" as root directory

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add `VITE_API_BASE_URL` with your Railway backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

### Step 5: Update CORS Settings

1. **Go back to Railway**
2. **Update CORS_ORIGINS** environment variable
3. **Add your Vercel frontend URL**
4. **Redeploy** (Railway will auto-redeploy)

---

## 🔍 Testing Your Deployment

### 1. Test Backend
```bash
# Health check
curl https://your-backend.railway.app/health

# API docs
curl https://your-backend.railway.app/docs
```

### 2. Test Frontend
- Visit your Vercel URL
- Try uploading a document
- Test the chat functionality

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure CORS_ORIGINS includes your frontend URL
   - Check that URLs don't have trailing slashes

2. **MongoDB Connection Issues**
   - Verify connection string is correct
   - Check that IP is whitelisted
   - Ensure database user has correct permissions

3. **OpenAI API Issues**
   - Verify API key is correct
   - Check that you have credits in your OpenAI account

4. **Build Failures**
   - Check that all dependencies are in requirements.txt
   - Verify that Python version is compatible

### Debugging Steps

1. **Check Logs**
   - Railway: Go to "Deployments" → Click on deployment → View logs
   - Vercel: Go to "Functions" → Click on function → View logs

2. **Test API Endpoints**
   - Use the `/health` endpoint to check service status
   - Use `/docs` endpoint to test API functionality

3. **Verify Environment Variables**
   - Make sure all required variables are set
   - Check that values are correct (no extra spaces, etc.)

---

## 💰 Cost Breakdown

### Free Tiers
- **Vercel**: Unlimited static sites, 100GB bandwidth/month
- **Railway**: $5 credit monthly (enough for small apps)
- **MongoDB Atlas**: 512MB storage, shared clusters
- **Total**: $0/month

### If You Need More
- **Railway**: $5/month for more resources
- **MongoDB Atlas**: $9/month for dedicated cluster
- **Vercel**: $20/month for Pro features

---

## 🔄 CI/CD Pipeline

Both platforms support automatic deployments:
- **Push to main branch** → Automatic deployment
- **Environment variables** managed in dashboards
- **Rollback capabilities** available
- **Preview deployments** for pull requests

---

## 📞 Support

If you encounter issues:
1. Check the logs in your hosting platforms
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check CORS configuration
5. Ensure MongoDB connection is working

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ **Frontend**: https://your-app.vercel.app
- ✅ **Backend**: https://your-app.railway.app
- ✅ **Database**: MongoDB Atlas cluster
- ✅ **Automatic deployments** from GitHub
- ✅ **HTTPS** enabled by default
- ✅ **Global CDN** for fast loading

Your AI Contract Review Platform is now live! 🚀
