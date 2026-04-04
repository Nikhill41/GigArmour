# Phase 2 Documentation (Automation and Protection)

Date: 2026-04-04

## Overview
Phase 2 focuses on automating protection for gig workers through a weekly parametric insurance workflow. The solution includes registration, policy management, dynamic premium calculation, and claims management with 3-5 automated triggers and zero-touch claim initiation.

This document aligns the current implementation to the DEVTrails 2026 Phase 2 requirements and clarifies how the project is Phase 2 ready.

## Phase 2 Goals (From the Use Case Document)
- Registration process for the delivery persona
- Insurance policy management (create, view, and activate weekly coverage)
- Dynamic premium calculation (weekly pricing)
- Claims management and automated claim triggers
- Seamless, zero-touch claim initiation

## Target Persona
Delivery partners working for food, grocery, and e-commerce platforms. The solution focuses on income loss protection only.

## Key Constraints (Respected)
- Coverage is for lost income only (no health, life, accident, or vehicle repair coverage)
- Premium is weekly to match gig worker earnings cycle

## User Flow (Phase 2)
1. Registration
   - Email OTP verification
   - Name + email + password (phone optional)
2. Policy Purchase
   - City (select), pincode, platform, average daily deliveries, work hours per day
   - User selects a plan: Bronze, Silver, or Diamond
   - Location captured via geolocation
3. Dynamic Premium
   - Weekly premium calculated based on risk profile
   - Plan multiplier applied for tiered coverage
4. Automated Triggers
   - Weather and environmental triggers fire automatically
5. Zero-Touch Claims
   - Claims are auto-created when triggers are hit
   - Status decided by fraud detection (auto, provisional, under review)

## Policy Plans (Phase 2)
Three weekly plans are offered with different thresholds and payouts.

- Bronze: Essential protection, higher thresholds, lower payouts
- Silver: Balanced protection (default)
- Diamond: Lower thresholds, higher payouts

Plan selection is stored on the policy and used to calculate coverage thresholds and payouts.

## Automated Triggers (3-5)
The system supports five automated triggers:
- heavy_rain
- extreme_heat
- flood_risk
- low_visibility
- aqi_spike

Each trigger has a threshold and payout defined by the selected plan.

## Dynamic Premium (Weekly)
Premium is based on a weekly risk model that considers:
- City risk factor
- Realtime weather and air quality signals
- Plan multiplier

This satisfies the requirement for dynamic weekly pricing and AI-style risk modeling (Phase 2 focus). The current model uses a transparent, explainable scoring approach as a baseline for ML-based extensions.

## Claims Management
- Zero-touch claim creation on trigger events
- Deduplication within a time window
- Status assignment via fraud detection
- Admin can update status or appeal handling

## Admin Trigger Simulator (Phase 2 Support)
- Admin-only trigger simulator for controlled testing
- Cities are loaded from DB (all cities) with active-policy cities highlighted
- Helps demonstrate automated trigger and claim flow

## APIs and Data Sources
- Tomorrow.io weather API (realtime)
- Mocked values where needed for simulations
- MongoDB for user, policy, risk profile, claims

## Architecture Summary (Phase 2)
Frontend (React + Vite + Tailwind):
- Registration + login with OTP
- Policy purchase and plan selection
- Dashboard (risk, policy, claims)
- Trigger simulator (admin)

Backend (Node + Express + MongoDB):
- Auth and OTP endpoints
- Policy purchase and weekly premium
- Trigger engine for automated claim creation
- Claims management and payout workflow stubs

External Services:
- Tomorrow.io realtime weather
- Razorpay test payouts (Phase 3 focus)

## Core API Endpoints (Phase 2)
Auth:
- POST /api/auth/request-otp
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/risk-profile

Policy:
- POST /api/policies/purchase
- GET /api/policies/active

Claims:
- POST /api/claims/manual-check
- GET /api/claims/my-claims

Weather:
- POST /api/weather/simulate (admin)
- GET /api/weather/active-cities (admin)

## Phase 2 Readiness Checklist
- Registration process: complete
- Policy management: complete
- Dynamic premium calculation: complete
- Claims management: complete
- Automated triggers (3-5): complete
- Zero-touch claim flow: complete

## Demo Guidance (Phase 2)
Suggested demo flow for the 2-minute video:
1. Register via email OTP
2. Buy policy with city + plan
3. Show premium and plan details
4. Run trigger simulator as admin
5. Show auto-created claim and status update

## How This Satisfies the Phase 2 Tips
- Dynamic pricing: weekly premium recalculated with live weather + location factors
- 3-5 triggers: five automated triggers defined
- Zero-touch claims: claims auto-created when triggers are met

## Limitations (Phase 2 Scope)
- ML model is currently an explainable heuristic model (ready for ML enhancement)
- Some APIs are mocked for simulation flows
- Fraud detection is baseline rules and flags

## Phase 2 Deliverables
- Executable source code with all required features
- Phase 2 demo script included in this document
- Repo docs updated in docs/phase-2.md

## Open Questions
- Do you want a separate Phase 2 demo script page in docs?
