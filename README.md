# GigArmour — AI-Powered Parametric Income Insurance for Gig Workers

**Version:** 1.0.0  
**Status:** Phase 2 Complete - Production Ready  
**Last Updated:** April 4, 2026  

Protecting India's delivery workforce from income loss caused by rain, pollution, and disruptions through automated parametric insurance.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Target Personas](#target-personas)
4. [Key Features](#key-features)
5. [Architecture](#architecture)
6. [Technology Stack](#technology-stack)
7. [Project Structure](#project-structure)
8. [Data Models & Schemas](#data-models--schemas)
9. [API Endpoints](#api-endpoints)
10. [Setup & Installation](#setup--installation)
11. [Running the Application](#running-the-application)
12. [Weekly Premium Model](#weekly-premium-model)
13. [Parametric Triggers & Coverage](#parametric-triggers--coverage)
14. [Claims Management](#claims-management)
15. [Fraud Detection](#fraud-detection)
16. [Admin Features](#admin-features)
17. [Development Guide](#development-guide)
18. [Phase 2 Features Checklist](#phase-2-features-checklist)
19. [Demo Flow](#demo-flow)
20. [Environment Variables](#environment-variables)

---

## Problem Statement

India has over **10 million gig delivery workers** (Zomato, Swiggy, Amazon, Zepto, Blinkit).  
Their income is **directly dependent on daily working conditions**.

External disruptions cause significant income loss:
- Heavy rainfall (workers avoid hazardous conditions)
- Air pollution spikes (AQI > 300 impacts deliveries)
- Floods and low visibility (operations halt)
- Heatwaves (extreme heat reduces work capacity)
- Curfews and lockdowns (forced downtime)

**Impact:** Workers face **20–30% monthly income loss** during disruption events, with **zero existing protection mechanisms**.

---

## Solution Overview

**GigArmour** is an **AI-powered parametric insurance platform** that:

✓ **Automatically detects disruptions** using real-time weather & environmental data  
✓ **Triggers payouts without manual claims** (zero-touch claim creation)  
✓ **Calculates personalized premiums** using AI risk modeling (by city, weather, activity)  
✓ **Prevents fraud** using multi-layer behavioral anomaly detection  
✓ **Offers flexible coverage** with 3 insurance plans (Bronze, Silver, Diamond)  
✓ **Operates on weekly billing cycles** to match gig worker earnings patterns  

---

## Target Personas

### Persona 1: Delivery Rider (Primary User)
- **Profile:** Works 8–12 hours daily across Zomato, Swiggy, Amazon, Zepto, or Blinkit
- **Pain Point:** Income drops 20–30% during weather disruptions (rain, AQI spikes, floods)
- **Goal:** Instant protection when unable to work due to external conditions
- **Technical Comfort:** Mobile/web-savvy, expects quick registration and fast payouts
- **Expected Outcome:** Automatic claims with minimal friction; payouts within hours

### Persona 2: Platform Administrator
- **Profile:** GigArmour operations team (fraud prevention, payout management, analytics)
- **Responsibilities:** Monitor claims, validate payouts, test trigger scenarios, manage fraud cases
- **Tools Needed:** Trigger simulator, claim dashboard, fraud flags, status update interface
- **Expected Outcome:** Quick fraud detection, seamless payout pipeline, audit trails

---

## Key Features

### 1. **Registration & Authentication**
- Email-based OTP verification (SMS optional)
- Password-protected accounts with JWT tokens
- Role-based access (rider, admin)
- Geolocation capture during registration

### 2. **Risk Profile & Premium Calculation**
- Dynamic risk assessment based on:
  - **City risk factor** (flood-prone, high-AQI zones)
  - **Real-time weather signals** (via Tomorrow.io API)
  - **Historical activity patterns**
- Three risk tiers: Low (₹20/week), Medium (₹40/week), High (₹70/week)
- Premium varies by selected plan and location

### 3. **Insurance Plans (Weekly Billing)**
- **Bronze:** Essential protection - higher thresholds, lower payouts
- **Silver:** Balanced protection - moderate thresholds, standard payouts (default)
- **Diamond:** Premium protection - lower thresholds, higher payouts

### 4. **Parametric Triggers (Automated Claims)**
- **Heavy Rain:** > 100mm precipitation in 3 hours → ₹500 payout
- **Extreme Heat:** > 45°C temperature → ₹400 payout
- **Flood Risk:** > 200mm daily accumulation → ₹1000 payout
- **Low Visibility:** < 200m visibility → ₹300 payout
- **AQI Spike:** AQI > 400 → ₹500 payout

Triggers check **every 30 minutes** via scheduled cron job.

### 5. **Zero-Touch Claims**
- Claims created automatically when triggers are met
- No user action required (worker doesn't need to file claim)
- Fraud detection runs immediately
- Status: auto-approved, provisional, or under-review
- Deduplication prevents multiple claims within same event window

### 6. **Fraud Detection**
- **Layer 1:** GPS integrity (network triangulation, signal metadata, speed continuity)
- **Layer 2:** Behavioral baseline (activity in zone, app usage, sensor data, claim timing)
- **Layer 3:** Network graph analysis (claim clustering, device fingerprints)
- **Layer 4:** Manual review flags (coordinator approval, anomaly escalation)
- Assigns fraud risk scores (0–100); claims flagged if score > 70

### 7. **Payout & Settlement**
- Razorpay integration (test mode in Phase 2, production ready)
- UPI payout capability
- Instant settlement for auto-approved claims
- Appeal mechanism for rejected claims
- Audit trail for all transactions

### 8. **Admin Dashboard**
- Trigger simulator (test claims manually)
- Claim status override (approve, reject, escalate)
- City list view with active policies highlighted
- Real-time fraud flags
- Analytics (premium collected, payouts issued, fraud rate)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   GigArmour System                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│  Frontend (React)    │     │   Backend (Node.js)  │
│  ─────────────────   │     │   ──────────────────  │
│ • Landing page       │────▶│ • Express server     │
│ • Login/Register     │     │ • JWT auth           │
│ • Policy purchase    │     │ • MongoDB models     │
│ • Dashboard          │     │ • Trigger engine     │
│ • Claims view        │     │ • Premium calculator │
│ • Admin trigger sim  │     │ • Fraud detection    │
└──────────────────────┘     └──────────────────────┘
         │                            │
         └────────────────┬───────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌─────────────┐              ┌──────────────────┐
    │ MongoDB     │              │ External APIs    │
    │ ─────────── │              │ ──────────────── │
    │ • Users     │              │ • Tomorrow.io    │
    │ • Policies  │              │   (Weather/AQI)  │
    │ • Claims    │              │ • Razorpay       │
    │ • OTPs      │              │   (Payouts)      │
    └─────────────┘              └──────────────────┘
```

### Data Flow: Disruption → Claim → Payout

```
1. Weather Event Occurs
   ↓
2. Cron Job Triggers Every 30 Minutes
   ├─ Fetch tomorrow.io data for all active user locations
   ├─ Check thresholds (rain, heat, AQI, etc.)
   ↓
3. Threshold Exceeded
   ├─ Query active policies for affected users
   ├─ Create claim records (zero-touch)
   ├─ Assign initial status: "pending_fraud_review"
   ↓
4. Fraud Detection Engine
   ├─ Calculate fraud risk score (GPS + behavioral + network analysis)
   ├─ Update claim status: "auto_approved" | "provisional" | "under_review"
   ↓
5. Payment Processing
   ├─ Auto-approved → Immediate UPI payout via Razorpay
   ├─ Provisional → Manual review by admin
   ├─ Under review → Escalation & investigation
   ↓
6. Worker Receives Payout
```

---

## Technology Stack

### Frontend
- **Framework:** React 19.2.4 (with Vite 8.0.1 for fast dev builds)
- **Routing:** React Router v7.14.0
- **Styling:** Tailwind CSS v4.2.2
- **UI Components:** React Hot Toast (notifications), Recharts (dashboards)
- **API Client:** Axios 1.14.0
- **Bundling:** Vite (dev server + production build)
- **Linting:** ESLint v9.39.4

### Backend
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB with Mongoose ODM v9.3.3
- **Auth:** JWT (jsonwebtoken v9.0.3), bcryptjs v3.0.3 for password hashing
- **Email:** Nodemailer v6.10.1 for OTP delivery
- **Scheduling:** node-cron v4.2.1 for trigger checks every 30 minutes
- **Payment:** Razorpay SDK v2.9.6
- **HTTP:** Axios v1.14.0 (for external APIs)
- **CORS:** cors v2.8.6

### External Services
- **Weather & AQI Data:** Tomorrow.io API (realtime, forecast, historical)
- **Payments:** Razorpay (test mode in Phase 2)
- **Email/SMS:** Nodemailer (OTP delivery)

---

## Project Structure

```
GigArmour/
├── README.md                          # This file
├── docs/
│   └── phase-2.md                     # Phase 2 detailed requirements & checklist
│
├── GigArmourBackend/                  # Node.js + Express backend
│   ├── server.js                      # Main server entry point
│   ├── package.json                   # Backend dependencies
│   ├── config/
│   │   └── db.js                      # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js          # Register, login, OTP, risk profile
│   │   ├── policyController.js        # Purchase policy, get active/all policies
│   │   ├── claimsController.js        # Get claims, manual trigger, appeals
│   │   ├── weatherController.js       # Weather triggers (admin simulator)
│   │   └── payoutController.js        # Payout status & processing
│   ├── models/
│   │   ├── User.js                    # User schema (name, email, city, platform, etc.)
│   │   ├── Policy.js                  # Policy schema (plan, premium, coverage details, dates)
│   │   ├── Claim.js                   # Claim schema (trigger, status, fraud score, amount)
│   │   ├── RiskProfile.js             # Risk assessment (risk tier, city factor, factors)
│   │   ├── EmailOtp.js                # OTP schema (email, code, expiry)
│   ├── routes/
│   │   ├── auth.js                    # /api/auth/* endpoints
│   │   ├── policy.js                  # /api/policies/* endpoints
│   │   ├── claims.js                  # /api/claims/* endpoints
│   │   ├── weather.js                 # /api/weather/* endpoints (admin)
│   │   └── payout.js                  # /api/payout/* endpoints
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification, role-based access
│   └── services/
│       ├── emailService.js            # OTP email sending
│       ├── premiumEngine.js           # Risk calculation, weekly premium
│       ├── fraudDetectionService.js   # Multi-layer fraud scoring
│       ├── triggerEngine.js           # Threshold checking, claim creation
│       ├── payoutService.js           # Razorpay integration
│       └── weatherService.js          # Tomorrow.io API integration
│
└── GigArmourFrontend/                 # React + Vite frontend
    ├── index.html                     # HTML entry point
    ├── vite.config.js                 # Vite build configuration
    ├── eslint.config.js               # ESLint rules
    ├── package.json                   # Frontend dependencies
    ├── src/
    │   ├── main.jsx                   # React app entry
    │   ├── App.jsx                    # Main app component
    │   ├── App.css                    # Global styles
    │   ├── index.css                  # Global CSS
    │   ├── api/
    │   │   └── axios.js               # Axios instance with base URL & interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx        # Global auth state (user, token, login/logout)
    │   ├── components/
    │   │   ├── Navbar.jsx             # Top navigation
    │   │   ├── ClaimCard.jsx          # Claim display component
    │   │   ├── PremiumDisplay.jsx     # Premium info component
    │   │   ├── RiskBadge.jsx          # Risk tier badge
    │   │   ├── TriggerSimulator.jsx   # Admin trigger test tool
    │   │   └── WeatherCard.jsx        # Weather display
    │   ├── pages/
    │   │   ├── Landing.jsx            # Home page (overview)
    │   │   ├── Login.jsx              # Login form
    │   │   ├── Register.jsx           # Registration + plan selection
    │   │   ├── Dashboard.jsx          # Main user dashboard
    │   │   ├── PolicyPage.jsx         # Policy details & purchase
    │   │   ├── ClaimsPage.jsx         # User's claims history
    │   │   └── AdminDashboard.jsx     # Admin trigger simulator
    ├── public/                        # Static assets
    └── assets/                        # Images, icons

```

---

## Data Models & Schemas

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String (unique, sparse),
  city: String (required for risk assessment),
  pincode: String,
  platform: String ["Zomato","Swiggy","Amazon","Zepto","Blinkit"],
  averageDailyDeliveries: Number,
  workHoursPerDay: Number,
  location: {
    lat: Number,
    lon: Number
  },
  passwordHash: String (hashed with bcryptjs),
  role: String ["rider", "admin"] (default: "rider"),
  createdAt: Date (default: now)
}
```

### Policy
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  weekStartDate: Date (required),
  weekEndDate: Date (required),
  premium: Number (required, weekly cost in ₹),
  plan: String ["bronze","silver","diamond"] (required),
  riskTier: String ["low","medium","high"] (required),
  status: String ["active","expired","cancelled"] (default: "active"),
  coverageDetails: {
    heavy_rain: {
      threshold: Number (mm),
      unit: String,
      payout: Number (₹)
    },
    extreme_heat: {
      threshold: Number (°C),
      unit: String,
      payout: Number (₹)
    },
    flood_risk: {
      threshold: Number (mm),
      unit: String,
      payout: Number (₹)
    },
    low_visibility: {
      threshold: Number (m),
      unit: String,
      payout: Number (₹)
    },
    aqi_spike: {
      threshold: Number,
      unit: String,
      payout: Number (₹)
    }
  },
  createdAt: Date (default: now)
}
```

### Claim
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  policyId: ObjectId (ref: Policy, required),
  triggerType: String ["heavy_rain","extreme_heat","flood_risk","low_visibility","aqi_spike"],
  triggerValue: Number (actual value that triggered the claim),
  claimAmount: Number (payout amount in ₹),
  status: String ["auto_approved","provisional","under_review","approved","rejected","paid"],
  fraudRiskScore: Number (0-100, higher = more suspicious),
  fraudFlags: [String] (array of fraud detection flags),
  paymentMethod: String ["upi", "bank_transfer"],
  paymentStatus: String ["pending","processed","failed"],
  createdAt: Date (default: now),
  updatedAt: Date (auto-update on status change)
}
```

### RiskProfile
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  city: String,
  riskTier: String ["low","medium","high"],
  cityRiskFactor: Number (0.0-1.0),
  weatherHistoryFactor: Number,
  activityLevelFactor: Number,
  calculatedAt: Date,
  weeklyPremiumBase: Number (before plan multiplier),
  createdAt: Date
}
```

### EmailOtp
```javascript
{
  _id: ObjectId,
  email: String (required, unique per active OTP),
  otp: String (6-digit code),
  expiresAt: Date (10 minutes from creation),
  verified: Boolean (default: false),
  createdAt: Date
}
```

---

## API Endpoints

All endpoints require `Content-Type: application/json`.  
Authenticated endpoints require `Authorization: Bearer {JWT_TOKEN}` header.

### **Authentication** (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request-otp` | ✗ | Send OTP to email |
| POST | `/register` | ✗ | Create account + risk profile |
| POST | `/login` | ✗ | Login, return JWT token |
| GET | `/me` | ✓ | Get logged-in user details |
| GET | `/risk-profile` | ✓ | Get user's risk assessment |
| POST | `/recalculate-risk` | ✓ | Recalculate risk (after city change) |

**Request/Response Examples:**

**POST /api/auth/request-otp**
```json
{
  "email": "rider@example.com"
}
```
Response:
```json
{
  "message": "OTP sent successfully"
}
```

**POST /api/auth/register**
```json
{
  "email": "rider@example.com",
  "name": "Raj Kumar",
  "password": "SecurePass123",
  "city": "Mumbai",
  "pincode": "400001",
  "otp": "123456"
}
```
Response:
```json
{
  "message": "User registered successfully",
  "userId": "...",
  "riskProfile": {
    "riskTier": "medium",
    "weeklyPremiumBase": 40
  }
}
```

**POST /api/auth/login**
```json
{
  "email": "rider@example.com",
  "password": "SecurePass123"
}
```
Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Raj Kumar",
    "email": "rider@example.com",
    "city": "Mumbai",
    "role": "rider"
  }
}
```

---

### **Policies** (`/api/policies`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/purchase` | ✓ | Buy/renew weekly policy |
| GET | `/my-policies` | ✓ | Get all user's policies |
| GET | `/active` | ✓ | Get current active policy |
| GET | `/active-count` | ✓ | Count active policies (admin) |

**POST /api/policies/purchase**
```json
{
  "plan": "silver"
}
```
Response:
```json
{
  "message": "Policy purchased successfully",
  "policy": {
    "_id": "...",
    "plan": "silver",
    "premium": 50,
    "riskTier": "medium",
    "weekStartDate": "2026-04-04T00:00:00Z",
    "weekEndDate": "2026-04-11T00:00:00Z",
    "status": "active",
    "coverageDetails": {
      "heavy_rain": { "threshold": 100, "unit": "mm", "payout": 500 },
      "extreme_heat": { "threshold": 45, "unit": "°C", "payout": 400 },
      ...
    }
  }
}
```

**GET /api/policies/active**
```json
Response:
{
  "policy": {
    "_id": "...",
    "plan": "silver",
    "status": "active",
    "premium": 50,
    "weekEndDate": "2026-04-11T00:00:00Z"
  }
}
```

---

### **Claims** (`/api/claims`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my-claims` | ✓ | Get user's claims history |
| POST | `/manual-check` | ✓ | Manually trigger claim check |
| POST | `/:claimId/appeal` | ✓ | Appeal rejected claim |
| GET | `/all` | ✓ | Get ALL claims (admin) |
| PATCH | `/:claimId/status` | ✓ | Admin update claim status |

**GET /api/claims/my-claims**
```json
Response:
{
  "claims": [
    {
      "_id": "...",
      "triggerType": "heavy_rain",
      "triggerValue": 120,
      "claimAmount": 500,
      "status": "auto_approved",
      "fraudRiskScore": 15,
      "createdAt": "2026-04-03T14:30:00Z",
      "paymentStatus": "paid"
    }
  ]
}
```

**POST /api/claims/manual-check**
```json
{
  "comment": "Requesting manual review"
}
```

**PATCH /api/claims/:claimId/status**
```json
{
  "status": "approved",
  "reason": "Verified manually"
}
```

---

### **Weather & Triggers** (`/api/weather`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/active-cities` | ✓ | List cities with active policies (admin) |
| POST | `/simulate` | ✓ | Manually trigger a weather event (admin) |

**POST /api/weather/simulate**
```json
{
  "city": "Mumbai",
  "triggerType": "heavy_rain",
  "metricValue": 120
}
```
Response:
```json
{
  "message": "Trigger simulated successfully",
  "claimsCreated": 5,
  "details": [
    {
      "userId": "...",
      "claimId": "...",
      "status": "pending_fraud_review"
    }
  ]
}
```

---

### **Payouts** (`/api/payout`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/status/:claimId` | ✓ | Get payout status |
| POST | `/process` | ✓ | Trigger payout processing |

---

## Setup & Installation

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** (local or Atlas cluster)
- **Tomorrow.io API Key** (weather data)
- **Razorpay Test Keys** (payment integration)
- **Git** for version control

---

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd GigArmourBackend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** in `GigArmourBackend/`:
   ```env
   # Database
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gigarmour?retryWrites=true&w=majority

   # API Keys
   TOMORROW_API_KEY=your_tomorrow_io_api_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   JWT_SECRET=your_jwt_secret_min_32_chars_long

   # Server
   PORT=5000
   NODE_ENV=development

   # Email (for OTP)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   ```

4. **Verify MongoDB connection:**
   ```bash
   node -e "require('./config/db')()"
   ```

---

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd GigArmourFrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** in `GigArmourFrontend/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Verify Vite configuration** (should already be in `vite.config.js`):
   ```javascript
   export default {
     server: {
       port: 5173,
       proxy: {
         '/api': 'http://localhost:5000'
       }
     }
   }
   ```

---

## Running the Application

### Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, no action needed (configured in .env)
```

### Start Backend Server
```bash
cd GigArmourBackend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Dev Server
```bash
cd GigArmourFrontend
npm run dev
# App runs on http://localhost:5173
```

### Build Frontend for Production
```bash
cd GigArmourFrontend
npm run build
# Output: dist/ folder (ready for deployment)
```

---

## Weekly Premium Model

### Risk Tiers

Premium is determined by city risk + plan selection:

| Risk Tier | Base Weekly Cost | City Examples |
|-----------|------------------|--------------------------|
| **Low** | ₹20 | Bangalore, Pune, Hyderabad |
| **Medium** | ₹40 | Delhi, Kolkata, Goa |
| **High** | ₹70 | Mumbai, Chennai, Jaipur |

### Plan Multipliers

Plan selection applies a coverage multiplier to base premium:

| Plan | Coverage Level | Premium Multiplier | Example (Medium City) |
|------|----------------|--------------------|-----------------------|
| **Bronze** | Essential | 0.75× | ₹30/week |
| **Silver** | Balanced | 1.0× | ₹40/week (default) |
| **Diamond** | Premium | 1.5× | ₹60/week |

### Premium Calculation Formula

```
Weekly Premium = Base Premium × Plan Multiplier × Live Weather Adjustment
```

**Components:**
- **Base Premium:** Determined by city risk tier
- **Plan Multiplier:** Bronze (0.75), Silver (1.0), Diamond (1.5)
- **Live Weather Adjustment:** Up to ±10% based on current conditions (optional for Phase 2)

### Example Scenarios

1. **New rider in Mumbai (high-risk), selects Silver:**
   - Base: ₹70/week
   - Multiplier: 1.0×
   - **Total: ₹70/week**

2. **Experienced rider in Bangalore (low-risk), selects Diamond:**
   - Base: ₹20/week
   - Multiplier: 1.5×
   - **Total: ₹30/week**

3. **Worker in Delhi (medium-risk), selects Bronze:**
   - Base: ₹40/week
   - Multiplier: 0.75×
   - **Total: ₹30/week**

### Weekly Billing Cycle

- **Week Duration:** Sunday 00:00 – Saturday 23:59 (IST)
- **Renewal:** Automatic (can be paused/cancelled anytime)
- **Refund Policy:** Pro-rated refunds if policy cancelled mid-week

---

## Parametric Triggers & Coverage

### Overview

Claims are **triggered automatically** when environmental thresholds are exceeded. No manual claim filing needed.

### Trigger Details

| # | Trigger | Threshold | Data Source | Payout | Plan Adjustments |
|---|---------|-----------|-------------|--------|------------------|
| **1** | Heavy Rain | > 100mm/3hr | Tomorrow.io precipitation | ₹500 | Bronze: ₹350, Silver: ₹500, Diamond: ₹750 |
| **2** | Extreme Heat | > 45°C | Tomorrow.io temperature | ₹400 | Bronze: ₹300, Silver: ₹400, Diamond: ₹600 |
| **3** | Flood Risk | > 200mm/day | Tomorrow.io accumulation | ₹1000 | Bronze: ₹700, Silver: ₹1000, Diamond: ₹1500 |
| **4** | Low Visibility | < 200m | Tomorrow.io visibility | ₹300 | Bronze: ₹200, Silver: ₹300, Diamond: ₹450 |
| **5** | AQI Spike | > 400 | Tomorrow.io + PM2.5 calc | ₹500 | Bronze: ₹350, Silver: ₹500, Diamond: ₹750 |

### Trigger Checking Schedule

- **Frequency:** Every 30 minutes (cron: `*/30 * * * *`)
- **Data Source:** Tomorrow.io realtime weather API
- **Location:** User's registered pincode/city
- **Condition:** Only active policies (status == "active" AND currentDate < weekEndDate)

### Deduplication Policy

- Same trigger type within **6 hours** = only one claim created
- Prevents duplicate payouts for same disruption event
- Both claims counted in fraud analysis (helps detect spam)

### Claim Status Workflow

```
Trigger Hit
    ↓
Claim Created (status: "pending_fraud_review")
    ↓
Fraud Detection Calculates Score
    ↓
├─ Score < 40 → "auto_approved" (instant payout)
├─ 40 ≤ Score < 70 → "provisional" (admin review)
└─ Score ≥ 70 → "under_review" (escalated)
    ↓
Admin Actions:
├─ Approve → "approved" → Process Payout
├─ Reject → "rejected" → Worker can appeal
└─ Flag Fraud → "fraud_detected" → Investigation
```

---

## Claims Management

### User Perspective

1. **Automatic Claim Creation**
   - User does NOT file claim manually
   - Claim auto-created when trigger threshold crossed
   - Notification sent (email/SMS) upon creation

2. **Real-Time Status Updates**
   - User can view claim status in dashboard
   - Status: pending → approved → paid / rejected
   - Appeal mechanism if claim rejected

3. **Claim History**
   - View all claims (current & past)
   - Filter by status, date range, trigger type
   - Download claim proof document

### Admin Perspective

1. **Claim Queue**
   - View claims pending manual review (fraud score 40-70)
   - Batch approve/reject claims
   - Track payout processing status

2. **Fraud Investigation**
   - View fraud risk score + flags for each claim
   - Cross-reference with GPS, activity, network data
   - Escalate suspicious claims to compliance team

3. **Appeals Management**
   - Process worker appeals for rejected claims
   - Add comments & decision notes
   - Send appeal outcome via email

### Claim Data Retention

- **Duration:** Retained for 7 years (regulatory compliance for insurance)
- **Archival:** auto-archived after 1 year (searchable but read-only)
- **Deletion:** Manual deletion only with audit trail

---

## Fraud Detection

GigArmour counters fraudsters through a **4-layer defense system**:

### Layer 1: GPS Integrity Verification

Detects spoofed location coordinates:

| Check | How It Works | Fraud Signal |
|-------|-------------|--------------|
| **Network Triangulation** | Compare GPS + cell tower + Wi-Fi positioning | >500m discrepancy |
| **Signal Metadata** | Verify satellite count, HDOP accuracy | Unnaturally perfect signal |
| **Speed Continuity** | Check if last 30-min movement is physically plausible | Teleportation (e.g., 8km in 2 min) |
| **Location Anchor** | Does claimed zone match worker's usual area? | First appearance in zone during crisis |
| **Altitude Matching** | GPS altitude vs. map elevation data | Impossible altitude readings |

### Layer 2: Behavioral Baseline Anomaly Detection

Every worker builds a fingerprint; claims are scored against it:

| Signal | What It Detects |
|--------|-----------------|
| **Active in Zone (7d)** | Has worker delivered in this location recently? |
| **App Activity (24h)** | Zomato/Swiggy app activity logged before claim? |
| **Sensor Data** | Accelerometer/gyro show movement or static? |
| **Last Delivery** | Claim filed within hours of a delivery? |
| **Device Fingerprint** | Single user per device, or shared device (fraud ring)? |

### Layer 3: Claim Velocity & Network Graph Analysis

Identifies coordinated fraud rings:

| Pattern | Risk Indicator |
|---------|----------------|
| **Simultaneous Claims** | 50+ new workers filing within 5 minutes →escalate |
| **Shared Device** | Multiple users from same device fingerprint → flag |
| **Zero History** | Account age < 7 days + claim in new zone → high risk |
| **Duplicate Location** | Same pincode, different users, identical claim times → ring |

### Layer 4: Manual Review & Escalation

Human expert intervention for edge cases:

- Claims with fraud score 70-100 routed to compliance team
- Cross-reference with platform partner data (Zomato/Swiggy APIs)
- Approve, reject, or request additional documentation
- Appeal mechanism for workers if falsely rejected

### Fraud Score Factors

Contributions to overall score (0-100):

| Factor | Low Risk | Medium | High Risk |
|--------|----------|--------|-----------|
| Account age | 28+ days: 0 pts | 7-27 days: 5 pts | <7 days: 15 pts |
| Recent zone activity | Yes (7d): 0 pts | No (7d): 5 pts | Never (0 pts) | 10 pts |
| App usage (24h) | Yes: 0 pts | Partial: 3 pts | No: 10 pts |
| Claim frequency | 1/week: 0 pts | 2-3/week: 5 pts | >3/week: 15 pts |
| Device sharing | Single user: 0 pts | 2 users: 5 pts | >2 users: 20 pts |
| GPS discrepancy | <100m: 0 pts | 100-500m: 5 pts | >500m: 25 pts |

---

## Admin Features

### Admin Dashboard (Accessible at `/admin`)

**Only users with `role: "admin"` can access:**

1. **Trigger Simulator**
   - Select city (auto-filtered to cities with active policies)
   - Choose trigger type (rain, heat, flood, visibility, AQI)
   - Enter metric value
   - Click "Simulate" → creates claims for all affected users in that city
   - View results: number of claims, fraud scores, statuses

2. **Claim Queue**
   - Filter: All, Auto-Approved, Provisional, Under Review, Paid
   - Bulk actions: approve, reject, escalate
   - View fraud flags for each claim
   - Add internal notes

3. **City Analytics**
   - Active policies per city
   - Total premium collected
   - Claim rates by trigger type
   - Fraud rate trends

4. **User Management**
   - Search users by email/phone
   - View user details + risk profile
   - Disable accounts (fraud investigation)
   - Export user list

---

## Development Guide

### Project Organization

- **Backend:** Separation of concerns (controllers, models, services, routes)
- **Frontend:** Component-based architecture, hooks for state management
- **Testing:** Manual testing via Postman for API, browser dev tools for frontend

### Code Style

- **Backend:** Async/await, error handling with try-catch, consistent variable naming
- **Frontend:** Functional components, React hooks (useState, useEffect, useContext), JSX
- **Database:** MongoDB indexing on frequently queried fields

### Common Development Tasks

#### 1. Add a New API Endpoint

**Backend Example:**
```javascript
// In controllers/claimsController.js
const getClaimSummary = async (req, res) => {
  const { userId } = req.user;
  const summary = await Claim.aggregate([
    { $match: { userId } },
    { $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$claimAmount" }
      }
    }
  ]);
  res.json({ summary });
};

// In routes/claims.js
router.get("/summary", protect, claimsController.getClaimSummary);
```

#### 2. Add a New Frontend Page

```javascript
// In pages/ClaimsSummary.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function ClaimsSummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("/api/claims/summary").then(res => setSummary(res.data.summary));
  }, []);

  return (
    <div>
      <h1>Claims Summary</h1>
      {summary?.map(s => (
        <div key={s._id}>{s._id}: {s.count} claims, ₹{s.totalAmount}</div>
      ))}
    </div>
  );
}
```

#### 3. Debug Trigger Engine

```bash
# In GigArmourBackend/server.js, add:
const triggerEngine = require("./services/triggerEngine");

// Manual test
triggerEngine.checkTriggersForUser("userId").then(console.log).catch(console.error);
```

#### 4. Test Fraud Detection

```javascript
// In services/fraudDetectionService.js
const fraudScore = await calculateFraudRiskScore(claim, user);
console.log(`Fraud Score for claim ${claim._id}: ${fraudScore}`);
// Score < 40: auto-approved
// 40 ≤ Score < 70: provisional
// Score ≥ 70: under-review
```

### Environment Variables Explained

**Backend `.env`:**
- `MONGO_URI`: MongoDB Atlas connection string (format: mongodb+srv://user:pass@cluster.mongodb.net/dbname)
- `TOMORROW_API_KEY`: From tomorrow.io dashboard → API Keys
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: From Razorpay dashboard → Settings → API Keys
- `JWT_SECRET`: Any strong random string (min 32 chars), used to sign/verify tokens
- `PORT`: Server port (default 5000)
- `EMAIL_USER`, `EMAIL_PASSWORD`: Gmail address + app-specific password for OTP emails

**Frontend `.env`:**
- `VITE_API_URL`: Backend API base URL (e.g., http://localhost:5000/api for dev)

### Debugging Tips

1. **Backend:**
   - Enable detailed logging: `console.log("[Service Name]", message)`
   - Check MongoDB connection: `db.getSiblingDB("admin").runCommand({connectionStatus: 1})`
   - Test API with Postman: import [routes] and test manually

2. **Frontend:**
   - Use React DevTools browser extension
   - Check network tab for API calls
   - Log state changes: `console.log("State:", state)`

3. **Weather Integration:**
   - Test Tomorrow.io API directly: `curl "https://api.tomorrow.io/v4/weather/realtime?location=Mumbai&apikey=KEY"`
   - Verify location coordinates (lat/lon)

---

## Phase 2 Features Checklist

✅ **User Registration & Authentication**
- Email OTP verification
- JWT-based session management
- Password hashing (bcryptjs)
- Role-based access (rider, admin)

✅ **Risk Profile & Premium Calculation**
- City risk factor assessment
- Live weather data integration (Tomorrow.io)
- Weekly premium calculation
- Three risk tiers (low, medium, high)

✅ **Insurance Plans**
- Bronze, Silver, Diamond plans
- Plan-specific thresholds & payouts
- Coverage details per plan
- Weekly billing cycle

✅ **Policy Management**
- Purchase weekly policies
- Auto-renewal capability
- Policy status tracking
- Active policy checks

✅ **Parametric Triggers**
- 5 automated triggers (rain, heat, flood, visibility, AQI)
- Real-time threshold monitoring (every 30 min)
- Zero-touch claim creation
- Deduplication within time windows

✅ **Claims Management**
- Auto-created claims on trigger
- Claim status workflow (pending → approved → paid/rejected)
- Appeal mechanism for rejected claims
- Claim history & filtering

✅ **Fraud Detection**
- Multi-layer fraud scoring (GPS + behavioral + network + manual)
- Fraud risk calculation (0-100 scale)
- Auto-approval for low-risk claims
- Manual review for high-risk claims

✅ **Admin Features**
- Trigger simulator for testing
- Claim queue & status updates
- City analytics dashboard
- User management & account controls

✅ **Frontend UI/UX**
- Landing page
- User registration flow
- Policy purchase interface
- Claims dashboard
- Admin dashboard with simulator

✅ **Backend API**
- 20+ endpoints across 5 routes
- Request validation & error handling
- JWT authentication middleware
- CORS enabled

✅ **External Integrations**
- Tomorrow.io weather API
- Razorpay payment gateway (test mode)
- Nodemailer for OTP emails

---

## Demo Flow

**For a 2-minute demo (recommended sequence):**

1. **Landing Page Walkthrough** (15 sec)
   - Show product overview
   - Highlight target users (delivery riders)

2. **User Registration** (20 sec)
   - Request OTP → enter email
   - Complete registration form (name, city, platform)
   - Show risk profile generated automatically

3. **Policy Purchase** (20 sec)
   - Select city + plan (Silver recommended)
   - Show premium calculation
   - Purchase policy → show confirmation

4. **Trigger Simulation** (30 sec)
   - Login as admin
   - Go to Admin Dashboard
   - Select city + trigger type (Heavy Rain)
   - Enter value (e.g., 120mm)
   - Click Simulate → see claims created in real-time

5. **Dashboard & Claims** (25 sec)
   - Switch to rider dashboard
   - Show auto-created claims
   - View claim status (auto_approved)
   - Show payout details

6. **Fraud Detection** (20 sec)
   - Explain 4-layer defense
   - Show fraud risk score on high-risk claim
   - Demonstrate manual review workflow

---

## Environment Variables

### Backend (GigArmourBackend/.env)

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigarmour?retryWrites=true&w=majority

# Tomorrow.io Weather API
TOMORROW_API_KEY=abc123xyz789

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_abc123
RAZORPAY_KEY_SECRET=test_secret_xyz789

# JWT
JWT_SECRET=your_super_secure_jwt_secret_with_at_least_32_characters

# Server
PORT=5000
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Frontend (GigArmourFrontend/.env)

```env
VITE_API_URL=http://localhost:5000/api
```

### How to Get Each Key

1. **MongoDB URI**
   - Create cluster at mongodb.com/atlas
   - Copy connection string
   - Replace username/password

2. **Tomorrow.io API Key**
   - Sign up free at tomorrow.io
   - Navigate to API Keys section
   - Use any tier (free tier sufficient for Phase 2)

3. **Razorpay Keys**
   - Sign up at razorpay.com
   - Go to Settings → API Keys
   - Copy Key ID and Key Secret (marked as "Key Secret")
   - Use test credentials (start with "rzp_test_")

4. **Gmail App Password**
   - Enable 2FA on Gmail account
   - Go to myaccount.google.com → Security
   - Generate App Password for "Mail"
   - Use 16-char password in EMAIL_PASSWORD

5. **JWT Secret**
   - Can be any random string, min 32 characters
   - Example: `openssl rand -base64 32`

---



Current implementation: **Web-based system**

Reasoning:
- Faster development and testing
- Easier API integration
- Suitable for admin dashboards

Future scope:
- Mobile app (React Native) for real-time worker usage

---

## 8. AI/ML Integration

### 1. Risk Assessment
- Uses historical weather + location data
- Assigns risk score to each worker
- Determines premium dynamically

### 2. Fraud Detection
- Detects:
  - GPS spoofing
  - Duplicate claims
  - Unusual activity patterns

### 3. Future Enhancements
- Predictive risk modeling
- Behavioral scoring
- Real-time anomaly detection

---

## 9. Adversarial Defense & Anti-Spoofing Strategy

> **Market Crash Scenario:** A coordinated fraud ring involving 500 fake delivery partners with spoofed GPS is attempting to drain GigArmour's liquidity pool by filing simultaneous false parametric claims. Here is how GigArmour detects and neutralizes the threat — without punishing legitimate workers.

---

### 9.1 The Attack Vector — How Fraudsters Exploit Parametric Systems

Parametric insurance is powerful because it's automatic — but that automation is also its attack surface. A fraud ring can:

1. **Spoof GPS coordinates** to place fake workers inside a disruption zone (e.g., a flood-affected pincode)
2. **File simultaneous claims** the moment a weather threshold is crossed
3. **Cycle fake identities** across multiple phone numbers / UPI accounts to avoid duplicate-claim checks
4. **Exploit real weather events** — the disruption is genuine, but the workers claiming are not present there

The key challenge: **the weather event is real. The worker is not.**

---

### 9.2 Multi-Layer Anti-Spoofing Architecture

GigArmour's fraud defense operates across **four independent signal layers**. A claim must clear all layers before payout is released.

---

#### Layer 1 — GPS Integrity Verification

Simple GPS coordinates are trivially spoofable. GigArmour cross-validates location through:

| Signal | What It Checks | Fraud Signal |
|--------|---------------|--------------|
| **Network triangulation** | Cell tower and Wi-Fi positioning vs. GPS | >500m discrepancy = flag |
| **GPS signal metadata** | Satellite count, HDOP accuracy, signal noise | Simulated GPS has unnaturally perfect signal |
| **Speed continuity check** | Was the worker's last 30-min movement physically plausible? | Teleportation (e.g., 0 → 8km in 2 min) = flag |
| **Historical location anchor** | Does the worker's claimed zone match their usual operating zone? | First-time appearance in a zone during a crisis = elevated risk score |
| **Altitude & terrain match** | GPS altitude vs. known map elevation data | Impossible altitude readings = flag |

**Key Insight:** A genuine delivery worker stranded in a flooded zone has a location *trail* leading there. A GPS spoofer appears in the zone *instantly* at the moment the weather threshold is crossed.

---

#### Layer 2 — Behavioral Baseline Anomaly Detection

Every registered worker on GigArmour builds a **behavioral fingerprint** over time:

- Average daily active hours
- Typical operating zones (pincode clusters)
- Average number of deliveries per shift
- Claim history and frequency

During a disruption event, the system runs anomaly checks:

| Behavioral Signal | Legitimate Worker | Fraud Ring Member |
|------------------|------------------|------------------|
| Active in claimed zone in last 7 days |  Yes |  No |
| Platform app activity (Zomato/Swiggy) in last 24hrs | Yes |  No / Absent |
| Device sensor data (accelerometer, gyroscope) | Shows movement | Static / abnormal |
| Claim timing vs. last delivery timestamp | Within hours | Never delivered recently |
| Number of co-claimants from same device fingerprint | 1 | Multiple (shared device) |

**Fraud Ring Pattern:** When 50+ workers with zero prior activity in a zone simultaneously file claims within minutes of a threshold trigger, that's statistically near-impossible for genuine workers — and the system flags the entire cohort for manual review without blocking any individual claim outright.

---

#### Layer 3 — Claim Velocity & Network Graph Analysis

A coordinated fraud ring leaves a **network signature**:

- **Claim velocity spike:** Genuine disruptions see a gradual rise in claims as workers realize conditions are bad. Fraud rings produce an *instant, synchronized spike* the moment the threshold is crossed.
- **Social graph clustering:** If 200 claimants all registered on the same day, from the same IP range, or via the same referral code — that's a coordinated onboarding event, not organic growth.
- **UPI account clustering:** Multiple claims routing to accounts linked to the same bank branch, same name pattern, or same KYC document = strong fraud signal.
- **Device fingerprint deduplication:** One physical device should not generate multiple independent worker identities. GigArmour hashes device fingerprints (IMEI, device ID, screen resolution, installed app set) during onboarding.

**Action:** Claims from flagged clusters are held in a **Provisional Payout Queue** — legitimate workers in the cluster still receive 70% of their payout immediately, with the remaining 30% released after a 48-hour review window.

---

#### Layer 4 — Third-Party Cross-Validation

GigArmour does not rely solely on its own data:

| External Signal | Purpose |
|----------------|---------|
| **Delivery platform activity API** (Zomato/Swiggy/Zepto — simulated) | Confirms worker was online and active before the disruption |
| **Telecom CDR patterns** (future integration) | Cell tower pings confirm physical presence |
| **Public weather station data** | Cross-validates Tomorrow.io data with IMD/SAFAR ground truth |
| **Social media geo-signals** | If a flood is real, there are public posts, news, traffic updates from that zone |
| **Google Maps traffic overlay** | Road closures and traffic anomalies corroborate the disruption |

---

### 9.3 Catching the Ring — Without Punishing Honest Workers

The hardest design problem: **How do you freeze a fraud ring's claims without blocking the 80% of genuine workers caught in the same event?**

GigArmour's answer: **Risk-Tiered Payout Release**

```
Claim Filed
    │
    ▼
Risk Score Calculated (0–100)
    │
    ├── Score 0–30  → INSTANT PAYOUT (no holds)
    │
    ├── Score 31–60 → PROVISIONAL PAYOUT (70% now, 30% after 24hr review)
    │
    └── Score 61–100 → HOLD + MANUAL REVIEW (worker notified, can appeal)
```

**Risk score inputs:**
- GPS integrity score (Layer 1)
- Behavioral anomaly score (Layer 2)
- Cluster/network risk (Layer 3)
- Cross-platform validation score (Layer 4)

Workers with a clean 6-month history automatically get their risk score reduced by 20 points — rewarding loyalty and making it harder for new fake accounts to pass.

---

### 9.4 What Catches a Fraud Ring Specifically

A fraud ring attacking GigArmour during a genuine rain event would fail at **multiple checkpoints simultaneously**:

1. **GPS appears in zone with no movement trail** → Layer 1 flag
2. **Never delivered in that zone before** → Layer 2 behavioral flag
3. **100 registrations from same IP range last week** → Layer 3 network flag
4. **No delivery platform activity in 30 days** → Layer 4 cross-validation fail
5. **All claims filed within 90 seconds of threshold breach** → Velocity anomaly flag

Any **3 or more simultaneous flags** escalates the claim to the fraud review queue. The worker is notified transparently: *"Your claim is under a 24-hour review. You will receive your payout once verification is complete."*

---

### 9.5 False Positive Protection — The Honest Stranded Worker

A genuine worker who:
- Has no internet during the disruption (can't confirm app activity)
- Is in an area with poor cell coverage (GPS noise is high)
- Is new to the platform (no behavioral history)

…should NOT be penalized. GigArmour handles this through:

- **Grace period claims:** Workers can submit a claim up to 6 hours after a disruption event ends, giving them time to get to safety and connectivity.
- **Appeal mechanism:** Any held claim can be appealed with a simple photo/video submission (e.g., photo of flooded road with timestamp metadata).
- **New worker protection:** Workers in their first 4 weeks get a **Trust Onboarding Period** — claims are paid out provisionally and reviewed post-facto rather than held.
- **Human review SLA:** No claim stays in review for more than 48 hours. If the review team cannot confirm fraud, the claim is paid.

---

### 9.6 Post-Attack Response

After a fraud attempt is detected:

1. **Flagged accounts** are suspended pending KYC re-verification
2. **Recovered funds** (from reversed fraudulent payouts) are returned to the liquidity pool
3. **Pattern signatures** from the attack are fed back into the ML model to improve future detection
4. **Transparency report** is generated for the admin dashboard showing the attack attempt, claims flagged, payouts held, and recovery rate

---

## 10. System Architecture

🔍 View full architecture diagram:  
https://drive.google.com/file/d/1NUybeqPgPuBFic3pa62bjfNXByBCXIj0/view?usp=drive_link

---

## 11. Tech Stack

| Layer       | Technology                      |
|------------|--------------------------------|
| Frontend   | React.js                       |
| Backend    | Node.js + Express.js           |
| Database   | MongoDB (Mongoose)             |
| AI Layer   | Node.js (custom logic)         |
| Weather API| Tomorrow.io                    |
| AQI Data   | OpenWeatherMap                 |
| Maps       | Google Maps API                |
| Payments   | Razorpay (Test Mode)           |

---

## 12. Development Plan

### Phase 1 (Current)
- Problem validation
- Architecture design
- Anti-spoofing strategy definition

### Phase 2
- Backend APIs
- Trigger engine
- Database setup
- Fraud detection module (Layer 1 + 2)

### Phase 3
- AI models
- Dashboard
- Demo system
- Network graph fraud analysis (Layer 3 + 4)


---

## 13. Demo Video

[video] :(https://youtu.be/8piHoe90DF8?si=iQVVLAGbX18gseE4)

---

## 14. Future Scope

- Mobile application
- Insurance company partnerships
- Advanced ML fraud detection
- Multi-city scaling
- Real-time GPS tracking
- Telecom CDR integration for presence verification

---

## License

MIT License
