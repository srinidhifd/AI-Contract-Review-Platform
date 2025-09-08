# ⚡ Quick Deployment Guide - 5 Minutes

## 🎯 What You'll Get
- **Frontend**: https://your-app.vercel.app (Free)
- **Backend**: https://your-app.railway.app (Free)
- **Database**: MongoDB Atlas (Free)
- **Total Cost**: $0/month

## 🚀 Step-by-Step (5 Minutes)

### 1. **MongoDB Atlas** (2 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up → Create free cluster → Get connection string

### 2. **Railway Backend** (2 minutes)
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub → New Project → Connect repo
3. Add environment variables:
   ```
   OPENAI_API_KEY=your_key_here
   MONGODB_URL=your_connection_string
   SECRET_KEY=generate_random_32_chars
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

### 3. **Vercel Frontend** (1 minute)
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub → Import Project → Select "frontend" folder
3. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```

## 🔧 Environment Variables

### Backend (Railway)
```bash
OPENAI_API_KEY=sk-your-openai-key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
SECRET_KEY=your-32-char-secret-key
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://your-app.railway.app
```

## 🛠️ Helper Scripts

### Auto-setup (Optional)
```bash
./setup-env.sh  # Interactive environment setup
./deploy.sh     # Build and prepare for deployment
```

## ✅ Testing

1. **Backend Health**: `https://your-backend.railway.app/health`
2. **Frontend**: Visit your Vercel URL
3. **Upload a document** and test chat

## 🚨 Common Issues

- **CORS Error**: Update CORS_ORIGINS with your Vercel URL
- **MongoDB Error**: Check connection string and IP whitelist
- **Build Error**: Check that all dependencies are in requirements.txt

## 📚 Full Documentation

- **Complete Guide**: `DEPLOYMENT.md`
- **Troubleshooting**: See troubleshooting section
- **Cost Details**: Free tiers explained

---

**That's it! Your AI Contract Review Platform will be live in 5 minutes! 🎉**
