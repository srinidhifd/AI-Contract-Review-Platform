# 🚂 Railway Root Directory Fix

## **Problem Identified:**
Railway is looking for `uvicorn` command but can't find it because:
1. Dependencies aren't being installed properly
2. The start command is incorrect for root directory setup

## **✅ Fixes Applied:**

### 1. **Updated railway.json**
```json
{
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### 2. **Created requirements.txt in root**
- Copied all dependencies from `backend/requirements.txt`
- Railway will now find and install them

### 3. **Created main.py in root**
- Imports the actual app from `backend/main.py`
- Handles the path correctly

### 4. **Updated nixpacks.toml**
- Removed `cd backend` commands since root is now `/backend`

## **🔧 Next Steps:**

### **Step 1: Fill in Environment Variables**
You need to set these in Railway dashboard (not in .env file):

```
OPENAI_API_KEY=sk-your-actual-key-here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/contract_review
SECRET_KEY=your-32-character-secret-here
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://your-frontend.vercel.app
```

### **Step 2: Commit and Push**
```bash
git add .
git commit -m "Fix Railway root directory deployment"
git push origin main
```

### **Step 3: Redeploy on Railway**
- Railway should automatically redeploy
- Check the build logs

## **🧪 Test the Fix:**

### **1. Check Build Logs**
Look for:
- ✅ Dependencies installing successfully
- ✅ No "uvicorn: command not found" errors
- ✅ Application starting

### **2. Test Health Endpoint**
```bash
curl https://your-railway-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "mongodb": "healthy",
    "openai": "healthy"
  }
}
```

## **🚨 Common Issues & Solutions:**

### **Issue 1: Still "uvicorn: command not found"**
**Solution:** Check if `uvicorn[standard]` is in requirements.txt

### **Issue 2: Import errors**
**Solution:** Verify the main.py import path is correct

### **Issue 3: Environment variables not working**
**Solution:** Set them in Railway dashboard, not in .env file

### **Issue 4: CORS errors**
**Solution:** Update CORS_ORIGINS with your Vercel URL

## **📊 Expected Results:**

After the fix, you should see:
- ✅ Build successful
- ✅ Dependencies installed
- ✅ uvicorn command found
- ✅ Application starting
- ✅ Health endpoint working

## **🎯 Quick Commands:**

```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Fix Railway root directory deployment"

# Push to GitHub
git push origin main

# Test after deployment
curl https://your-railway-url.railway.app/health
```

## **🔑 Environment Variables Setup:**

### **In Railway Dashboard:**
1. Go to your project
2. Click on "Variables" tab
3. Add these variables:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `MONGODB_URL` = your MongoDB connection string
   - `SECRET_KEY` = generate a random 32+ character string
   - `ENVIRONMENT` = production
   - `DEBUG` = false
   - `CORS_ORIGINS` = https://your-frontend.vercel.app

### **Generate SECRET_KEY:**
Use this online generator: https://generate-secret.vercel.app/32

---

**Your Railway deployment should now work with root directory setup! 🚂✨**
