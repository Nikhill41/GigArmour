const axios = require("axios");

const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const RiskProfile = require("../models/RiskProfile");
const User = require("../models/User");
const fraudDetectionService = require("../services/fraudDetectionService");
const { estimateAqiFromPm25 } = require("./premiumEngine");

const fetchRealtimeWeather = async (location) => {
  const response = await axios.get("https://api.tomorrow.io/v4/weather/realtime", {
    params: {
      location,
      fields:
        "rainIntensity,temperature,visibility,particulateMatter25,aqiEPA,precipitationProbability",
      units: "metric",
      apikey: process.env.TOMORROW_API_KEY
    }
  });

  return response.data?.data?.values || {};
};

const evaluateTriggers = async (userId, weatherSnapshot) => {
  const user = await User.findById(userId);
  if (!user) {
    console.warn(`[TriggerEngine] User ${userId} not found`);
    return { claims: [], autoApproved: 0, provisional: 0, underReview: 0, triggered: [] };
  }

  console.log(`[TriggerEngine] Evaluating triggers for user: ${user.email} (${user.city})`);

  const today = new Date();
  const activePolicy = await Policy.findOne({
    userId: user._id,
    status: "active",
    weekEndDate: { $gt: today }
  });

  if (!activePolicy) {
    console.warn(`[TriggerEngine] ❌ No active policy found for user ${user.email}`);
    console.warn(`[TriggerEngine]    Check: status="active" AND weekEndDate > ${today.toISOString()}`);
    return { claims: [], autoApproved: 0, provisional: 0, underReview: 0, triggered: [] };
  }

  console.log(`[TriggerEngine] ✓ Active policy found for user ${user.email}`);
  console.log(`[TriggerEngine] Policy plan: ${activePolicy.plan}, expires: ${activePolicy.weekEndDate.toISOString()}`);
  console.log(`[TriggerEngine] Full policy object:`, JSON.stringify(activePolicy.toObject ? activePolicy.toObject() : activePolicy, null, 2));
  console.log(`[TriggerEngine] Policy coverageDetails available: ${!!activePolicy.coverageDetails}`);
  if (activePolicy.coverageDetails) {
    console.log(`[TriggerEngine] Coverage details keys: ${Object.keys(activePolicy.coverageDetails).join(", ")}`);
    console.log(`[TriggerEngine] Heavy rain coverage: threshold=${activePolicy.coverageDetails.heavy_rain?.threshold}, payout=${activePolicy.coverageDetails.heavy_rain?.payout}`);
  }

  const rainIntensity = weatherSnapshot.rainIntensity || 0;
  const temperature = weatherSnapshot.temperature || 0;
  const visibility = weatherSnapshot.visibility || 0;
  const finalAQI = weatherSnapshot.finalAQI || 0;

  console.log(`[TriggerEngine] Weather snapshot:
    - Rain: ${rainIntensity} mm/hr
    - Temp: ${temperature}°C
    - Visibility: ${visibility} m
    - AQI: ${finalAQI}
  `);

  const triggers = [
    {
      type: "heavy_rain",
      value: rainIntensity * 3,
      threshold: activePolicy.coverageDetails?.heavy_rain?.threshold || 100,
      payout: activePolicy.coverageDetails?.heavy_rain?.payout || 0
    },
    {
      type: "extreme_heat",
      value: temperature,
      threshold: activePolicy.coverageDetails?.extreme_heat?.threshold || 45,
      payout: activePolicy.coverageDetails?.extreme_heat?.payout || 0
    },
    {
      type: "flood_risk",
      value: rainIntensity * 3,
      threshold: activePolicy.coverageDetails?.flood_risk?.threshold || 200,
      payout: activePolicy.coverageDetails?.flood_risk?.payout || 0
    },
    {
      type: "low_visibility",
      value: visibility,
      threshold: activePolicy.coverageDetails?.low_visibility?.threshold || 200,
      payout: activePolicy.coverageDetails?.low_visibility?.payout || 0,
      condition: "below"
    },
    {
      type: "aqi_spike",
      value: finalAQI,
      threshold: activePolicy.coverageDetails?.aqi_spike?.threshold || 400,
      payout: activePolicy.coverageDetails?.aqi_spike?.payout || 0
    }
  ];

  const riskProfile = await RiskProfile.findOne({ userId: user._id });
  const riskScore = riskProfile?.riskScore ?? 0;

  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  const createdClaims = [];
  const triggeredTypes = [];
  let autoApproved = 0;
  let provisional = 0;
  let underReview = 0;

  for (const entry of triggers) {
    const fired = entry.condition === "below" ? entry.value < entry.threshold : entry.value > entry.threshold;
    
    // FIX #3: Add detailed logging for each trigger check
    console.log(`[TriggerEngine] Checking ${entry.type}:
      Value: ${entry.value.toFixed(2)}
      Threshold: ${entry.threshold}
      Condition: ${entry.condition === "below" ? "<" : ">"}
      Fired: ${fired ? "✓ YES" : "✗ NO"}
    `);

    if (!fired) {
      continue;
    }

    const existingClaim = await Claim.findOne({
      userId: user._id,
      triggerType: entry.type,
      createdAt: { $gte: twelveHoursAgo }
    });

    if (existingClaim) {
      console.log(`[TriggerEngine] ⚠️  Claim already exists for ${entry.type} within last 12 hours, skipping deduplication`);
      continue;
    }

    console.log(`[TriggerEngine] ✓ Creating claim for ${entry.type} with ₹${entry.payout} payout`);

    const claim = await Claim.create({
      userId: user._id,
      policyId: activePolicy._id,
      triggerType: entry.type,
      triggerValue: entry.value,
      threshold: entry.threshold,
      payoutAmount: entry.payout,
      status: "pending",
      riskScore,
      fraudFlags: []
    });

    const fraudResult = await fraudDetectionService.calculateFraudRiskScore(claim, user);
    console.log(`[TriggerEngine] Fraud detection: score=${fraudResult.riskScore}, decision=${fraudResult.decision}, flags=[${fraudResult.flags.join(", ")}]`);

    if (fraudResult.decision === "approved") {
      autoApproved += 1;
    } else if (fraudResult.decision === "provisional") {
      provisional += 1;
    } else {
      underReview += 1;
    }

    createdClaims.push(claim);
    triggeredTypes.push(entry.type);
  }

  console.log(`[TriggerEngine] ✓ Evaluation complete: ${createdClaims.length} claims created (approved: ${autoApproved}, provisional: ${provisional}, under_review: ${underReview})`);

  return {
    claims: createdClaims,
    autoApproved,
    provisional,
    underReview,
    triggered: triggeredTypes
  };
};

const checkTriggersForUser = async (userId, coords) => {
  const user = await User.findById(userId);
  if (!user) {
    return { triggered: false, claims: [], weatherSnapshot: null };
  }

  const locationParam =
    coords?.lat && coords?.lon
      ? `${coords.lat},${coords.lon}`
      : user.location?.lat && user.location?.lon
        ? `${user.location.lat},${user.location.lon}`
        : `${user.city}, India`;

  const values = await fetchRealtimeWeather(locationParam);
  const rainIntensity = values.rainIntensity || 0;
  const temperature = values.temperature || 0;
  const visibility = values.visibility || 0;
  const pm25 = values.particulateMatter25 || 0;
  const aqiEPA = values.aqiEPA;
  const computedAQI = estimateAqiFromPm25(pm25);
  const finalAQI = aqiEPA ?? computedAQI;

  const result = await evaluateTriggers(userId, {
    rainIntensity,
    temperature,
    visibility,
    finalAQI
  });

  const summary = {
    city: user.city,
    checked: new Date().toISOString(),
    values: {
      rainIntensity,
      temperature,
      visibility,
      finalAQI
    },
    triggered: result.triggered
  };

  console.log("Trigger summary:", summary);

  return {
    triggered: result.claims.length > 0,
    claims: result.claims,
    weatherSnapshot: {
      rainIntensity,
      temperature,
      visibility: visibility * 1000,
      finalAQI,
      lat: coords?.lat ?? user.location?.lat ?? null,
      lon: coords?.lon ?? user.location?.lon ?? null
    }
  };
};

const checkTriggersForAll = async () => {
  const today = new Date();
  const userIds = await Policy.find({
    status: "active",
    weekEndDate: { $gt: today }
  }).distinct("userId");

  const results = [];
  for (const userId of userIds) {
    const result = await checkTriggersForUser(userId);
    results.push(...result.claims);
  }

  return results;
};

module.exports = {
  checkTriggersForUser,
  checkTriggersForAll,
  evaluateTriggers
};
