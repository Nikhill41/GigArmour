const axios = require("axios");

const Policy = require("../models/Policy");
const triggerEngine = require("./triggerEngine");

const getWeatherSnapshot = async ({ lat, lon }) => {
  return {
    provider: "mock",
    lat,
    lon,
    message: "Integrate Tomorrow.io and OpenWeatherMap here"
  };
};

const getCurrentWeatherByCity = async (city) => {
  const response = await axios.get("https://api.tomorrow.io/v4/weather/realtime", {
    params: {
      location: `${city}, India`,
      fields: "rainIntensity,temperature,visibility,particulateMatter25,aqiEPA",
      units: "metric",
      apikey: process.env.TOMORROW_API_KEY
    }
  });

  const values = response.data?.data?.values || {};
  return {
    rainIntensity: values.rainIntensity || 0,
    temperature: values.temperature || 0,
    visibility: values.visibility || 0,
    particulateMatter25: values.particulateMatter25 || 0,
    aqiEPA: values.aqiEPA
  };
};

const simulateWeatherEvent = async (city, condition, value) => {
  const today = new Date();
  const allowedConditions = [
    "heavy_rain",
    "extreme_heat",
    "flood_risk",
    "low_visibility",
    "aqi_spike"
  ];

  if (!allowedConditions.includes(condition)) {
    throw new Error("Unsupported condition");
  }

  console.log(`[WeatherService] Simulating ${condition} in ${city} with value ${value}`);

  const policies = await Policy.find({
    status: "active",
    weekEndDate: { $gt: today }
  }).populate("userId");

  console.log(`[WeatherService] Found ${policies.length} active policies total`);

  // FIX #1: Make city comparison case-insensitive and trim whitespace
  const targetPolicies = policies.filter((policy) => {
    const userCity = policy.userId?.city?.trim().toLowerCase();
    const targetCity = city.trim().toLowerCase();
    return policy.userId && userCity === targetCity;
  });

  console.log(`[WeatherService] Found ${targetPolicies.length} active policies in city "${city}"`);

  const mockWeather = {
    heavy_rain: {
      rainIntensity: value,
      temperature: 30,
      visibility: 2000,
      finalAQI: 80
    },
    extreme_heat: {
      rainIntensity: 0,
      temperature: value,
      visibility: 5000,
      finalAQI: 120
    },
    flood_risk: {
      rainIntensity: value,
      temperature: 28,
      visibility: 500,
      finalAQI: 90
    },
    low_visibility: {
      rainIntensity: 5,
      temperature: 25,
      visibility: value,
      finalAQI: 200
    },
    aqi_spike: {
      rainIntensity: 0,
      temperature: 32,
      visibility: 3000,
      finalAQI: value
    }
  };

  const weatherSnapshot = mockWeather[condition];
  let autoApproved = 0;
  let provisional = 0;
  let underReview = 0;
  let claimsCreated = 0;
  const claimedUsers = [];

  // FIX #2: Add validation and detailed logging for each user
  if (targetPolicies.length === 0) {
    console.warn(`[WeatherService] ⚠️  WARNING: No active policies found in city "${city}". Check if:
      1. Users have purchased active policies
      2. Policies haven't expired (weekEndDate > today)
      3. User city matches exactly (case-insensitive)
    `);
    return {
      city,
      condition,
      value,
      usersChecked: 0,
      claimsCreated: 0,
      autoApproved: 0,
      provisional: 0,
      underReview: 0,
      warning: `No active policies found in city: ${city}`
    };
  }

  for (const policy of targetPolicies) {
    console.log(`[WeatherService] Processing user ${policy.userId._id} in ${policy.userId.city}`);
    console.log(`[WeatherService] Passing to triggerEngine: userId=${policy.userId._id}, weatherSnapshot=`, JSON.stringify(weatherSnapshot));
    try {
      const result = await triggerEngine.evaluateTriggers(policy.userId._id, weatherSnapshot);
      console.log(`[WeatherService] ✓ triggerEngine returned:`, JSON.stringify(result));
      claimsCreated += result.claims.length;
      autoApproved += result.autoApproved;
      provisional += result.provisional;
      underReview += result.underReview;

      if (result.claims.length > 0) {
        claimedUsers.push({
          userId: policy.userId._id,
          email: policy.userId.email,
          claimsCreated: result.claims.length,
          triggered: result.triggered
        });
      }
      console.log(`[WeatherService] ✓ User processed: ${result.claims.length} claims created`);
    } catch (error) {
      console.error(`[WeatherService] ❌ Error for user ${policy.userId._id}: ${error.message}`);
    }
  }

  console.log(`[WeatherService] ✓ Simulation complete: ${claimsCreated} total claims created`);

  return {
    city,
    condition,
    value,
    usersChecked: targetPolicies.length,
    claimsCreated,
    autoApproved,
    provisional,
    underReview,
    claimedUsers
  };
};

module.exports = {
  getWeatherSnapshot,
  simulateWeatherEvent,
  getCurrentWeatherByCity
};
