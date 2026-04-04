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

  const policies = await Policy.find({
    status: "active",
    weekEndDate: { $gt: today }
  }).populate("userId");

  const targetPolicies = policies.filter((policy) => {
    return policy.userId && policy.userId.city === city;
  });

  const mockWeather = {
    heavy_rain: {
      rainIntensity: value / 3,
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
      rainIntensity: value / 3,
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

  for (const policy of targetPolicies) {
    const result = await triggerEngine.evaluateTriggers(policy.userId._id, weatherSnapshot);
    claimsCreated += result.claims.length;
    autoApproved += result.autoApproved;
    provisional += result.provisional;
    underReview += result.underReview;
  }

  return {
    city,
    condition,
    value,
    usersChecked: targetPolicies.length,
    claimsCreated,
    autoApproved,
    provisional,
    underReview
  };
};

module.exports = {
  getWeatherSnapshot,
  simulateWeatherEvent,
  getCurrentWeatherByCity
};
