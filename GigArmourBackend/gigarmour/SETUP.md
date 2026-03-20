# GigArmour — Setup Guide

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
```
Opens at http://localhost:3000 — done!

---

## Deploy to Vercel

### Option A — Via Vercel CLI (fastest)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Build the app
npm run build

# Deploy
vercel --prod
```
Follow the prompts — Vercel auto-detects React. You'll get a live URL in ~60 seconds.

### Option B — Via GitHub (recommended for ongoing use)
1. Push this folder to your GitHub repo
2. Go to vercel.com → New Project
3. Import your GitHub repo
4. Vercel auto-detects `react-scripts` and sets build command to `npm run build`
5. Click Deploy — live in ~2 minutes
6. Every future `git push` auto-deploys

---

## Project Structure

```
gigarmour/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Dashboard.js        ← Metrics, charts, recent payouts
│   │   ├── Onboarding.js       ← Worker registration + AI risk profile
│   │   ├── PremiumCalculator.js ← Dynamic weekly pricing
│   │   ├── LiveTriggers.js     ← Real-time trigger monitoring + simulation
│   │   ├── Claims.js           ← Claims management with filtering
│   │   └── FraudDefense.js     ← Market Crash anti-spoofing architecture
│   ├── App.js                  ← Main shell + navigation
│   ├── index.css               ← All styles
│   └── index.js                ← React entry point
├── package.json
├── vercel.json                 ← Vercel routing config
└── SETUP.md                    ← This file
```
