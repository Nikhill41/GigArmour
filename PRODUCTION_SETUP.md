# GigArmour - Production Deployment Ready ✅

This guide explains the code changes made for production deployment on Vercel + Railway.

---

## 🔧 Code Changes Made

### 1. Backend CORS Configuration (server.js)

**What Changed:**
- Changed from `app.use(cors())` (allows all origins)
- To configurable CORS with whitelist for production

**Why:**
- Production security: Only allow requests from your frontend
- Prevents unauthorized API access
- Supports Vercel preview deployments and local development

**Environment Variable:**
```
FRONTEND_URL=https://gigarmour-frontend.vercel.app
```

**Allowed Origins:**
- `http://localhost:5173` (local Vite dev)
- `http://localhost:5174` (Vite alternative port)
- `http://localhost:3000` (common React port)
- Your `FRONTEND_URL` from env
- Any `*.vercel.app` domain (for preview deployments)

---

### 2. Frontend API Client (src/api/axios.js)

**What Changed:**
- Changed from hardcoded: `baseURL: "http://localhost:5000/api"`
- To environment-based: `baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"`

**Why:**
- Different URLs for dev vs production
- No need to change code when deploying
- Supports multiple environments (preview, staging, production)

**How It Works:**
```javascript
// Development: Uses default localhost
VITE_API_URL is not set → falls back to http://localhost:5000/api

// Production on Vercel: Uses Railway backend
VITE_API_URL=https://gigarmour-backend.railway.app/api
```

---

### 3. Health Check Endpoints (server.js)

**New Endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Basic health check |
| `GET /health` | Detailed health with DB status |

**Usage:**
- Vercel/Railway use these to monitor your app
- Shows database connection status
- Helps detect deployment issues

**Example Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-04-05T12:00:00.000Z"
}
```

---

## 🚀 Environment Setup

### Backend (Railway)
[See DEPLOYMENT.md for full setup]

```env
# Copy these to Railway Variables
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
TOMORROW_API_KEY=your-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_ACCOUNT_NUMBER=your-account
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Frontend (Vercel)
[See DEPLOYMENT.md for full setup]

```env
# Copy this to Vercel Environment Variables
VITE_API_URL=https://your-railway-backend.railway.app/api
```

---

## 🔍 Verification Checklist

Before deploying, verify:

- [ ] Backend CORS allows your Vercel domain
- [ ] Frontend has correct `VITE_API_URL` in Vercel
- [ ] MongoDB URI is correct
- [ ] All environment variables are set
- [ ] Code is pushed to GitHub
- [ ] `.env` file is in `.gitignore` (not committed)

---

## 🐛 Debugging CORS Issues

If you see: `"No 'Access-Control-Allow-Origin' header"`

1. Check exact Vercel URL: `https://gigarmour-frontend.vercel.app`
2. Go to Railway → Variables
3. Update `FRONTEND_URL` to match exactly (no trailing slash)
4. Wait for auto-redeploy
5. Test again

---

## 📊 Testing Production Setup Locally

```bash
# Terminal 1: Start backend with production env
FRONTEND_URL=http://localhost:5173 npm start

# Terminal 2: Start frontend
VITE_API_URL=http://localhost:5000/api npm run dev

# Both should now communicate with proper CORS headers
```

---

## 🎯 What's Different from Local Development

| Aspect | Local | Production |
|--------|-------|-----------|
| API URL | http://localhost:5000 | https://railway.app |
| CORS Policy | All origins | Only Vercel URL |
| Database | Local/Test | MongoDB Atlas |
| Logs | Console | Railway/Vercel Dashboard |
| Errors | Full stack trace | Limited info |
| Performance | Single machine | Auto-scaling |

---

## 📝 Files Added/Modified

**Added Files:**
- `.env.example` - Template for environment variables
- `DEPLOYMENT.md` - Full deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Quick reference
- `GigArmourFrontend/vercel.json` - Vercel config
- `GigArmourFrontend/.env.example` - Frontend env template

**Modified Files:**
- `GigArmourBackend/server.js` - CORS configuration + health checks
- `GigArmourFrontend/src/api/axios.js` - Environment-based URL
- `GigArmourBackend/.env.example` - Environment template (created)

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Use `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Rotate secrets regularly** - Update in Railway dashboard
4. **Use HTTPS only** - Railway/Vercel handle this
5. **Validate all inputs** - Already configured
6. **Limit CORS origins** - Only your frontend domain

---

## 📞 Support

### Common Issues

**"CORS error" → Check FRONTEND_URL in Railway**

**"Cannot connect to MongoDB" → Verify MONGO_URI and IP whitelist**

**"API returns 500" → Check Railway logs**

**"Frontend shows blank" → Check Vercel build logs**

See `DEPLOYMENT.md` for detailed troubleshooting.

---

## 🎉 You're Ready!

Follow the `DEPLOYMENT_CHECKLIST.md` for step-by-step deployment.

Your GigArmour app will be live in under 10 minutes! 🚀
