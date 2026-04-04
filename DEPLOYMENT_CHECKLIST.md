# Quick Deployment Checklist for Vercel + Railway

## Step 1: MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create free M0 cluster
- [ ] Create database user (username: `gigarmour`)
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Get connection URI: `mongodb+srv://...`

## Step 2: Railway Backend Setup
- [ ] Create Railway account
- [ ] Connect GitHub repo
- [ ] Select `GigArmourBackend` folder
- [ ] Set these environment variables:

```
MONGO_URI=mongodb+srv://gigarmour:PASSWORD@cluster.mongodb.net/gigarmour
JWT_SECRET=your-secret-key-here-make-it-long
TOMORROW_API_KEY=your-tomorrow-io-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_ACCOUNT_NUMBER=your-account-number
NODE_ENV=production
FRONTEND_URL=https://gigarmour-frontend.vercel.app
```

- [ ] Deploy
- [ ] **Save the Railway URL**: Note the generated URL (e.g., `https://gigarmour-backend-xyz.railway.app`)

## Step 3: Vercel Frontend Setup
- [ ] Create Vercel account
- [ ] Connect GitHub repo
- [ ] Select `GigArmourFrontend` folder
- [ ] Set environment variable:

```
VITE_API_URL=https://YOUR-RAILWAY-URL/api
```

- [ ] Deploy

## Step 4: Final Configuration
- [ ] Update Railway `FRONTEND_URL` to match your Vercel URL
- [ ] Wait for Railway auto-redeploy (2-3 minutes)

## Step 5: Testing
- [ ] Open frontend URL in browser
- [ ] Try to register/login
- [ ] Check browser console (F12) for errors
- [ ] If CORS error, verify:
  - FRONTEND_URL in Railway matches exactly
  - No trailing slashes

## Quick URLs After Deployment
- **Frontend**: https://gigarmour-frontend.vercel.app
- **Backend API**: https://gigarmour-backend-xyz.railway.app/api
- **Health check**: Curl `https://gigarmour-backend-xyz.railway.app/`

## Troubleshooting
If CORS error appears:
1. Right-click → Inspect
2. Go to Console tab
3. See exact error message
4. Check Railway logs: Dashboard → Logs
5. Verify FRONTEND_URL setting

If API 500 error:
1. Check Railway logs for MongoDB/server errors
2. Verify MONGO_URI is correct
3. Check all required env vars are set
4. Check Vercel frontend logs

Good luck! 🚀
