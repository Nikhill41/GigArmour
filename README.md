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
