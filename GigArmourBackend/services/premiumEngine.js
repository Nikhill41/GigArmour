const axios = require("axios");

const User = require("../models/User");
const RiskProfile = require("../models/RiskProfile");

const calculateWeeklyPremium = (riskTier) => {
  const rates = {
    low: 200,
    medium: 400,
    high: 700
  };

  return rates[riskTier] || null;
};

const estimateAqiFromPm25 = (avgPM25) => {
  if (avgPM25 <= 12) {
    return (avgPM25 / 12) * 50;
  }
  if (avgPM25 <= 35.4) {
    return 51 + ((avgPM25 - 12.1) / 23.3) * 49;
  }
  if (avgPM25 <= 55.4) {
    return 101 + ((avgPM25 - 35.5) / 19.9) * 49;
  }
  if (avgPM25 <= 150.4) {
    return 151 + ((avgPM25 - 55.5) / 94.9) * 49;
  }
  return 201 + ((avgPM25 - 150.5) / 149.4) * 99;
};

const fetchRealtimeMetrics = async (location) => {
  const response = await axios.get("https://api.tomorrow.io/v4/weather/realtime", {
    params: {
      location,
      fields: "rainIntensity,temperature,visibility,particulateMatter25",
      units: "metric",
      apikey: process.env.TOMORROW_API_KEY
    }
  });

  return response.data?.data?.values || {};
};

const calculateRiskProfile = async (userId) => {
  console.log("[PremiumEngine] Starting for userId:", userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.city) {
    throw new Error("City is required to calculate risk profile");
  }

  console.log("[PremiumEngine] User found:", user.name, user.city);

  const cityRiskMap = {
    Mumbai: 0.9,
    Delhi: 0.85,
    Chennai: 0.75,
    Kolkata: 0.8,
    Bengaluru: 0.6,
    Bangalore: 0.6,
    Pune: 0.55,
    Jaipur: 0.65,
    Mathura: 0.55,
    Lucknow: 0.7,
    Kanpur: 0.75,
    Agra: 0.6,
    Meerut: 0.65,
    Kheri: 0.55,
    Lakhimpur: 0.55,
    Noida: 0.7,
    Ghaziabad: 0.7,
    Varanasi: 0.65,
    Allahabad: 0.65,
    Prayagraj: 0.65,
    Hyderabad: 0.65,
    Ahmedabad: 0.6,
    Surat: 0.65,
    Bhopal: 0.55
  };

  const cityRiskValue =
    cityRiskMap[user.city] ?? cityRiskMap[user.city?.trim()] ?? 0.5;

  let weatherRisk = 0;
  let aqiRisk = 0;
  let riskScore = Math.round(cityRiskValue * 100);

  let weatherValues = {};

  try {
    const locationParam =
      user.location?.lat && user.location?.lon
        ? `${user.location.lat},${user.location.lon}`
        : `${user.city}, India`;
    weatherValues = await fetchRealtimeMetrics(locationParam);
    console.log("[PremiumEngine] Tomorrow.io response:", JSON.stringify(weatherValues, null, 2));

    const rainIntensity = weatherValues.rainIntensity || 0;
    const pm25 = weatherValues.particulateMatter25 || 0;
    const finalAQI = estimateAqiFromPm25(pm25);

    weatherRisk = Math.min((rainIntensity * 3) / 100, 1) * 40;
    aqiRisk = Math.min(finalAQI / 500, 1) * 30;

    const locationRisk = cityRiskValue * 30;
    riskScore = Math.round(weatherRisk + aqiRisk + locationRisk);
    riskScore = Math.max(
      riskScore,
      Math.round(cityRiskValue * 100 * 0.3)
    );
  } catch (error) {
    console.error("Tomorrow.io risk profile error:", error.message);
  }

  const riskTier = riskScore <= 35 ? "low" : riskScore <= 65 ? "medium" : "high";
  const premiumMap = { low: 20, medium: 40, high: 70 };
  const weeklyPremium = premiumMap[riskTier] || 40;

  const riskProfile = await RiskProfile.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      city: user.city,
      riskScore,
      riskTier,
      locationRiskFactor: cityRiskValue,
      historicalWeatherRisk: weatherRisk,
      weeklyPremium,
      lastCalculatedAt: new Date()
    },
    { new: true, upsert: true }
  );

  console.log(
    "[PremiumEngine] Calculated riskScore:",
    riskScore,
    "tier:",
    riskTier,
    "premium:",
    weeklyPremium
  );
  console.log("[PremiumEngine] RiskProfile saved:", riskProfile);

  return riskProfile;
};

const recalculateAll = async () => {
  const users = await User.find({ role: "rider" });
  const results = [];

  for (const user of users) {
    const profile = await calculateRiskProfile(user._id);
    results.push(profile);
  }

  return results;
};

module.exports = {
  calculateWeeklyPremium,
  calculateRiskProfile,
  recalculateAll,
  estimateAqiFromPm25
};
