# 🛡️ GigArmour — AI-Powered Parametric Income Insurance for Gig Workers

> Protecting India's delivery workforce from income loss caused by rain,
> floods, pollution, curfews & disruptions — automatically.

---

## 🚨 The Problem

India's 10M+ gig delivery workers (Zomato, Swiggy, Zepto, Amazon) lose
20–30% of monthly income due to external disruptions like heavy rain,
AQI spikes, and curfews — with zero income protection available today.

---

## 💡 Our Solution

GigArmour is a **parametric income insurance platform** that:
- 🤖 Uses AI to assess risk and calculate dynamic premiums
- ⚡ Automatically triggers claims when disruptions are detected
- 💸 Instantly pays workers — no claim filing needed
- 🔍 Detects fraud using anomaly detection AI
- 🌧️ Uses **Tomorrow.io** for hyper-local, real-time weather intelligence

---

## 🏗️ System Architecture

![System Architecture](./docs/diagrams/system-architecture.png)

---

## ⚙️ Core Features

| Feature | Description |
|---|---|
| AI Risk Assessment | Dynamic premium based on city, weather history, work zone |
| Parametric Triggers | Auto-detects rain >100mm, AQI >400, flood alerts |
| Instant Payouts | UPI/Razorpay payment on trigger |
| Fraud Detection | GPS spoof detection, duplicate claim prevention |
| Dual Dashboards | Worker + Admin analytics |
| 🌧️ Tomorrow.io Integration | Hyper-local precipitation, storm & severe weather alerts |

---

## 🌧️ Tomorrow.io — Weather Intelligence Layer

GigArmour uses **[Tomorrow.io](https://www.tomorrow.io)** as its primary
weather data source for parametric trigger detection.

### Why Tomorrow.io?
| Feature | Benefit for GigArmour |
|---|---|
| Hyper-local data (500m grid) | Pinpoint rain detection at worker's exact zone |
| Real-time precipitation rate | Triggers claim the moment threshold is crossed |
| Hourly & minutely forecasts | Predict disruptions before they happen |
| Severe weather alerts | Instant flood, storm & heatwave notifications |
| Historical weather data | Powers AI risk scoring for each city/zone |
| REST API (JSON) | Easy backend integration |

### Triggers Powered by Tomorrow.io

| Disruption | Tomorrow.io Field | Threshold | Payout |
|---|---|---|---|
| Heavy Rain | `precipitationIntensity` | > 100mm/3hr | ₹500 |
| Extreme Heat | `temperature` | > 45°C | ₹400 |
| Thunderstorm | `weatherCode` | Storm codes | ₹600 |
| Flood Risk | `precipitationAccumulation` | > 200mm/day | ₹1000 |
| Visibility Loss | `visibility` | < 200m | ₹300 |

### Sample API Call
```javascript
GET https://api.tomorrow.io/v4/weather/realtime
  ?location=12.9716,77.5946   // Bengaluru coordinates
  &fields=precipitationIntensity,temperature,weatherCode
  &apikey=YOUR_TOMORROW_IO_KEY
```

### Sample Response Used for Triggering
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
> ⚡ When `precipitationIntensity > 100`, GigArmour auto-triggers
> a claim for all active workers in that location zone.

---

## 🔄 How It Works

1. Worker registers → AI builds risk profile
2. Worker buys weekly policy (₹20–₹70)
3. **Tomorrow.io** monitors weather 24/7 at worker's location
4. Trigger threshold crossed → Claim auto-initiated
5. Fraud check runs → Payout sent instantly via UPI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python (FastAPI) |
| AI/ML | Risk scoring, fraud detection |
| Weather Intelligence | **Tomorrow.io API** |
| Air Quality | OpenWeatherMap Air Pollution API |
| Maps & Location | Google Maps API |
| Payments | Razorpay (Test Mode) |
| Database | PostgreSQL |

---

## 📁 Folder Structure
```
GigArmour/
├── README.md
├── LICENSE
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── business-model.md
│   ├── persona.md
│   ├── api-integrations.md
│   └── diagrams/
├── phase-1/
├── phase-2/
├── phase-3/
├── backend/
│   ├── integrations/
│   │   ├── tomorrow_io.py       ← Tomorrow.io integration
│   │   ├── razorpay.py
│   │   └── maps.py
│   ├── triggers/
│   │   ├── weather_trigger.py   ← Uses Tomorrow.io data
│   │   ├── pollution_trigger.py
│   │   └── trigger_engine.py
│   └── ai/
│       ├── risk_assessment.py
│       └── fraud_detection.py
├── frontend/
└── mock-apis/
    ├── tomorrow_mock.json       ← Mock Tomorrow.io response
    └── payment_mock.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ / Node.js 18+
- PostgreSQL
- Tomorrow.io API Key → [Get free key here](https://app.tomorrow.io/signup)
- Razorpay Test Account

### Installation
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/GigArmour.git
cd GigArmour

# Backend setup
cd backend
pip install -r requirements.txt

# Add your API keys
cp .env.example .env
# Fill in your keys in .env

# Run the server
uvicorn main:app --reload
```

### Environment Variables (`.env`)
```
TOMORROW_IO_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
GOOGLE_MAPS_KEY=your_key_here
DATABASE_URL=postgresql://user:password@localhost/gigarmour
```

> ⚠️ Never push `.env` to GitHub. It is listed in `.gitignore`.

---

## 👥 Team

| Name | Role |
|---|---|
| [Nikhil] | Backend & AI |
| [Ishant] | Frontend |
| [Dev] | Business & Pitch |
| [ManiKant] | Integrations & DevOps |

---

## 📅 Development Phases

- ✅ Phase 1 (Weeks 1-2): Ideation & Architecture
- 🔄 Phase 2 (Weeks 3-4): Core System Build
- ⏳ Phase 3 (Weeks 5-6): Advanced Features & Demo

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.
