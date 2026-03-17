# 🛡️ GigArmour — AI-Powered Parametric Income Insurance for Gig Workers

> Protecting India's delivery workforce from income loss caused by rain, floods, pollution, curfews & disruptions — automatically.

---

## 🚨 The Problem

India's 10M+ gig delivery workers (Zomato, Swiggy, Zepto, Amazon) lose **20–30% of monthly income** due to external disruptions like heavy rain, AQI spikes, and curfews — with **zero income protection** available today.

---

## 💡 Our Solution

GigArmour is a **parametric income insurance platform** that:

* 🤖 Uses AI to assess risk and calculate dynamic premiums
* ⚡ Automatically triggers claims when disruptions are detected
* 💸 Instantly pays workers — no claim filing needed
* 🔍 Detects fraud using anomaly detection AI
* 🌧️ Uses **Tomorrow.io** for hyper-local, real-time weather intelligence

---

## 🏗️ System Architecture

```
Worker App → Backend (Node.js + Express) → Trigger Engine → AI Layer → Payments (Razorpay)
                                        ↓
                                 Tomorrow.io API
                                        ↓
                                    MongoDB
```

---

## ⚙️ Core Features

| Feature                     | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| AI Risk Assessment          | Dynamic premium based on city, weather history, work zone |
| Parametric Triggers         | Auto-detects rain >100mm, AQI >400, flood alerts          |
| Instant Payouts             | UPI/Razorpay payment on trigger                           |
| Fraud Detection             | GPS spoof detection, duplicate claim prevention           |
| Dual Dashboards             | Worker + Admin analytics                                  |
| 🌧️ Tomorrow.io Integration | Hyper-local precipitation, storm & severe weather alerts  |

---

## 🌧️ Tomorrow.io — Weather Intelligence Layer

GigArmour uses **https://www.tomorrow.io** as its primary weather data source.

### Why Tomorrow.io?

* Hyper-local weather data (500m precision)
* Real-time precipitation tracking
* Forecast APIs for prediction
* Severe weather alerts (floods, storms, heatwaves)
* Historical data for AI risk scoring
* Easy REST API integration

---

### Triggers Powered by Tomorrow.io

| Disruption      | Field                       | Threshold   | Payout |
| --------------- | --------------------------- | ----------- | ------ |
| Heavy Rain      | `precipitationIntensity`    | > 100mm/3hr | ₹500   |
| Extreme Heat    | `temperature`               | > 45°C      | ₹400   |
| Thunderstorm    | `weatherCode`               | Storm codes | ₹600   |
| Flood Risk      | `precipitationAccumulation` | > 200mm/day | ₹1000  |
| Visibility Loss | `visibility`                | < 200m      | ₹300   |

---

### Sample API Call

```javascript
GET https://api.tomorrow.io/v4/weather/realtime
  ?location=12.9716,77.5946
  &fields=precipitationIntensity,temperature,weatherCode
  &apikey=YOUR_TOMORROW_IO_KEY
```

---

### Sample Response

```json
{
  "data": {
    "values": {
      "precipitationIntensity": 112.4,
      "temperature": 24.1,
      "weatherCode": 4201
    }
  }
}
```

> ⚡ When thresholds are crossed, GigArmour automatically triggers payouts.

---

## 🔄 How It Works

1. Worker registers → AI builds risk profile
2. Worker buys weekly policy (₹20–₹70)
3. Tomorrow.io monitors weather continuously
4. Trigger condition met → claim auto-initiated
5. Fraud detection runs → payout sent via UPI

---

## 🛠️ Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Frontend    | React.js                                 |
| Backend     | **Node.js + Express.js**                 |
| AI/ML       | Risk scoring & fraud detection (Node.js) |
| Weather     | Tomorrow.io API                          |
| Air Quality | OpenWeatherMap API                       |
| Maps        | Google Maps API                         |
| Payments    | Razorpay(TEST MODE)                                 |
| Database    | **MongoDB (Mongoose)**                   |

---

## 📁 Folder Structure

```
GigArmour/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── policy.model.js
│   │   │   └── claim.model.js
│   │   ├── routes/
│   │   │   ├── user.routes.js
│   │   │   ├── policy.routes.js
│   │   │   └── claim.routes.js
│   │   ├── controllers/
│   │   │   ├── user.controller.js
│   │   │   ├── policy.controller.js
│   │   │   └── claim.controller.js
│   │   ├── integrations/
│   │   │   ├── tomorrowIo.js
│   │   │   ├── razorpay.js
│   │   │   └── maps.js
│   │   ├── triggers/
│   │   │   ├── weatherTrigger.js
│   │   │   ├── pollutionTrigger.js
│   │   │   └── triggerEngine.js
│   │   ├── ai/
│   │   │   ├── riskAssessment.js
│   │   │   └── fraudDetection.js
│   │   ├── utils/
│   │   │   └── scheduler.js
│   │   │
│   │   └── app.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
├── docs/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* MongoDB (Local / Atlas)
* Tomorrow.io API Key
* Razorpay Test Account

---

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/GigArmour.git
cd GigArmour/backend

npm install

cp .env.example .env

npm run dev
```

---

## 🔑 Environment Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gigarmour

TOMORROW_IO_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
GOOGLE_MAPS_KEY=your_key_here
```

> ⚠️ Never commit `.env` file.

---

## ⏱️ Background Jobs

* Weather monitoring (cron jobs)
* Auto trigger engine
* Fraud detection checks

---

## 👥 Team

| Name     | Role         |
| -------- | ------------ |
| [Manikant] | Backend & AI |
| [Ishaan Varshney] | Frontend    |
| [Dev Mishra] | Business     |
| [Nikhil Pal] | DevOps and Backend    |

---

## 📅 Development Phases

* ✅ Phase 1: Ideation & Architecture
* 🔄 Phase 2: Backend Development
* ⏳ Phase 3: AI + Dashboard + Demo

---

## 📜 License

MIT License

---

## ⭐ Future Scope

* Real-time GPS tracking
* Advanced ML fraud detection
* Insurance company integration
* Mobile app (React Native)
* Multi-city scaling

---
