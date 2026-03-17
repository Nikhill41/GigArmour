# GigArmour — AI-Powered Parametric Income Insurance for Gig Workers

Protecting India's delivery workforce from income loss caused by rain, pollution, and disruptions through automated parametric insurance.

---

## 1. Problem Statement

India has over 10 million gig delivery workers (Zomato, Swiggy, Amazon, Zepto).  
Their income is directly dependent on daily working conditions.

External disruptions such as:
- Heavy rainfall
- Air pollution (AQI spikes)
- Floods and low visibility
- Heatwaves and curfews

lead to **20–30% monthly income loss**, with **no existing income protection system**.

---

## 2. Target Users (Personas)

### Persona 1: Delivery Rider (Primary User)
- Works 8–12 hours daily
- Earnings depend on completed deliveries
- Avoids working during rain/pollution due to safety
- Needs instant financial protection

### Persona 2: Platform Operator / Admin
- Monitors claims and payouts
- Ensures fraud prevention
- Tracks system analytics

---

## 3. Solution Overview

GigArmour is a **parametric insurance platform** that:

- Automatically detects disruptions using real-time data
- Triggers payouts without manual claims
- Uses AI to calculate personalized premiums
- Prevents fraud using anomaly detection

---

## 4. Application Workflow

1. User registers and location is captured  
2. AI generates a risk profile based on:
   - City
   - Weather history
   - Work patterns  

3. User purchases a weekly insurance plan  
4. System continuously monitors weather and AQI data  
5. If predefined thresholds are crossed:
   - Trigger engine activates
   - Claim is automatically generated  

6. Fraud detection layer validates activity  
7. Payout is sent instantly via UPI  

---

## 5. Weekly Premium Model

The premium is dynamically calculated using:

- Location risk (flood-prone / high AQI zones)
- Historical weather data
- Worker activity level

### Example:
- Low-risk city → ₹20/week  
- Medium-risk → ₹40/week  
- High-risk → ₹70/week  

This ensures:
- Affordability for workers  
- Sustainability of the system  

---

## 6. Parametric Triggers

Claims are triggered automatically when thresholds are met:

| Condition        | Parameter                    | Threshold        | Payout |
|-----------------|----------------------------|------------------|--------|
| Heavy Rain      | precipitationIntensity      | > 100mm / 3hr    | ₹500   |
| Extreme Heat    | temperature                 | > 45°C           | ₹400   |
| Flood Risk      | precipitationAccumulation   | > 200mm/day      | ₹1000  |
| Low Visibility  | visibility                  | < 200m           | ₹300   |
| AQI Spike       | AQI                         | > 400            | ₹500   |

---

## 7. Platform Choice (Web vs Mobile)

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

## 9. System Architecture

🔍 View full architecture diagram:  
https://drive.google.com/file/d/1NUybeqPgPuBFic3pa62bjfNXByBCXIj0/view?usp=drive_link

---

## 10. Tech Stack

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

## 11. Development Plan

### Phase 1
- Problem validation
- Architecture design

### Phase 2 (Current)
- Backend APIs
- Trigger engine
- Database setup

### Phase 3
- AI models
- Dashboard
- Demo system

---

## 12. Repository

GitHub Repository:  
https://github.com/YOUR_USERNAME/GigArmour

---

## 13. Demo Video

(Attach your 2-minute video link here)

---

## 14. Future Scope

- Mobile application
- Insurance company partnerships
- Advanced ML fraud detection
- Multi-city scaling
- Real-time GPS tracking

---

## License

MIT License
