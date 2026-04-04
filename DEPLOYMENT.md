# GigArmour Cloud Deployment Guide
## Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

### Prerequisites
- GitHub account with code pushed
- MongoDB Atlas account (free tier available)
- Vercel account (free)
- Railway account (free tier available)
- Tomorrow.io API key (weather data)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Create a free account or sign in
3. Create a new cluster:
   - Click "Create a Deployment"
   - Select "M0 Free" tier
   - Choose region closest to your users
   - Create cluster
4. Create database user:
   - Click "Database Access"
   - Add new database user
   - Username: `gigarmour`
   - Password: Generate secure password
   - Role: `readWriteAnyDatabase`
5. Create IP Whitelist:
   - Click "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all - for development)
6. Get connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the URI: `mongodb+srv://gigarmour:PASSWORD@cluster.mongodb.net/gigarmour`
   - Replace PASSWORD with your database user password

Save this URI - you'll need it for Railway!

---

## Step 2: Deploy Backend on Railway

### 2.1 Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (easier for deployment)

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `GigArmour` repository
4. Railway auto-detects Node.js

### 2.3 Configure Environment Variables
In Railway dashboard, go to Variables and add:

```
MONGO_URI=mongodb+srv://gigarmour:PASSWORD@cluster.mongodb.net/gigarmour
JWT_SECRET=use-a-strong-random-string-like-this-1a2b3c4d5e6f
TOMORROW_API_KEY=your-tomorrow-io-api-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_ACCOUNT_NUMBER=your-account-number
NODE_ENV=production
FRONTEND_URL=https://gigarmour-frontend.vercel.app
```

### 2.4 Configure Build & Start
- Root Directory: `GigArmourBackend`
- Build Command: `npm install`
- Start Command: `npm start`

### 2.5 Deploy
Click "Deploy" and Railway will:
1. Build your project
2. Create PostgreSQL option (decline if not needed)
3. Generate a Railway URL: `https://gigarmour-backend.railway.app`

**Save this URL - you'll need it for Vercel!**

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 3.2 Create New Project
1. Click "Add New..." → "Project"
2. Select your `GigArmour` repository
3. Vercel will auto-detect it's a Vite project

### 3.3 Configure Project Settings
- **Framework Preset**: Vite React
- **Root Directory**: `GigArmourFrontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.4 Add Environment Variables
Before deploying, add in "Environment Variables":

```
VITE_API_URL=https://YOUR-RAILWAY-BACKEND-URL/api
```

Replace `YOUR-RAILWAY-BACKEND-URL` with the actual Railway URL from Step 2.5

### 3.5 Deploy
Click "Deploy" button

Vercel will:
1. Build your frontend
2. Deploy to CDN
3. Generate URL: `https://gigarmour-frontend.vercel.app`

---

## Step 4: Update Backend CORS

After getting your Vercel URL:

1. Go back to Railway dashboard
2. Click on your backend service
3. Go to Variables
4. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   FRONTEND_URL=https://gigarmour-frontend.vercel.app
   ```
5. Railway auto-redeploys

---

## Step 5: Final Checks

### Test the deployment:
1. Go to `https://gigarmour-frontend.vercel.app`
2. Try to log in or register
3. Check browser console (F12) for API errors
4. If you see CORS errors:
   - Verify `FRONTEND_URL` in Railway matches your Vercel URL
   - Make sure there are no trailing slashes

### Check logs:
- **Railway logs**: Dashboard → Logs tab
- **Vercel logs**: Dashboard → Deployments → View Logs

---

## Common Issues & Solutions

### ❌ CORS Error: "No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Copy your exact Vercel URL (e.g., `https://gigarmour-frontend.vercel.app`)
2. Go to Railway → Environment Variables
3. Set: `FRONTEND_URL=your-exact-vercel-url`
4. Save and wait for auto-redeploy (2-3 mins)

### ❌ MongoDB Connection Error

**Solution:**
1. Check MONGO_URI format: `mongodb+srv://user:password@cluster.mongodb.net/gigarmour`
2. Verify password doesn't have special characters (or URL-encode them)
3. Check IP whitelist in MongoDB Atlas allows `0.0.0.0/0`

### ❌ API returns 500 errors

**Check Railway logs:**
1. Go to Railway dashboard
2. Click your backend service
3. Click "Logs" tab
4. Look for error messages

### ❌ Environment variables not loading

**Solution:**
1. Go to Railway Variables tab
2. Verify all required vars are set
3. Redeploy by pushing a commit to GitHub or clicking "Redeploy"

---

## Redeployment (After Code Changes)

### Backend:
1. Push changes to GitHub
2. Railway auto-redeploys within 1-2 minutes
3. Check Railway logs for build errors

### Frontend:
1. Push changes to GitHub
2. Vercel auto-redeploys within 1-2 minutes
3. Check Vercel logs for build errors

---

## Environment Variable Reference

### Backend (.env)
```
MONGO_URI              → MongoDB connection string
JWT_SECRET             → Random string for token signing
TOMORROW_API_KEY       → API key from tomorrow.io
RAZORPAY_KEY_ID        → Razorpay public key
RAZORPAY_KEY_SECRET    → Razorpay secret key
RAZORPAY_ACCOUNT_NUMBER → Razorpay account number
NODE_ENV               → "production"
FRONTEND_URL           → Your Vercel frontend URL
PORT                   → Railway sets this automatically
```

### Frontend (.env.local or Vercel Variables)
```
VITE_API_URL  → Your Railway backend URL + "/api"
               → Example: https://gigarmour-backend.railway.app/api
```

---

## Monitoring & Maintenance

### Railway Monitoring:
- **CPU/Memory**: Dashboard shows usage
- **Build Status**: Green checkmark = success
- **Redeploy**: Click to force redeploy if needed
- **Logs**: Real-time logs for debugging

### Vercel Monitoring:
- **Build logs**: View in Deployments tab
- **Metrics**: DashBoard → Analytics
- **Preview deployments**: Auto-generated for PRs

---

## Cost Summary

- **MongoDB Atlas**: Free tier (512MB storage)
- **Railway**: Free tier ($5 credit/month, usually enough)
- **Vercel**: Free tier (1000 Function Invocations/month)
- **Tomorrow.io**: Free tier (200 calls/day)

Total cost: **FREE** for development

---

## Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Deploy backend on Railway
3. ✅ Deploy frontend on Vercel
4. ✅ Test API connectivity
5. ✅ Share your live URL with users!

Your GigArmour app is now live! 🚀
