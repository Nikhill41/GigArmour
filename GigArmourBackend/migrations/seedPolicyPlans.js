const PolicyPlan = require("../models/PolicyPlan");

const policyPlansData = [
  {
    name: "bronze",
    label: "Bronze",
    description: "Starter cover with essential protection.",
    multiplier: 0.9,
    coverageDetails: {
      heavy_rain: { threshold: 120, unit: "mm/3hr", payout: 400 },
      extreme_heat: { threshold: 46, unit: "celsius", payout: 300 },
      flood_risk: { threshold: 220, unit: "mm/day", payout: 800 },
      low_visibility: { threshold: 180, unit: "meters", payout: 250 },
      aqi_spike: { threshold: 420, unit: "AQI", payout: 400 }
    },
    isActive: true
  },
  {
    name: "silver",
    label: "Silver",
    description: "Balanced cover for daily riders.",
    multiplier: 1.0,
    coverageDetails: {
      heavy_rain: { threshold: 100, unit: "mm/3hr", payout: 500 },
      extreme_heat: { threshold: 45, unit: "celsius", payout: 400 },
      flood_risk: { threshold: 200, unit: "mm/day", payout: 1000 },
      low_visibility: { threshold: 200, unit: "meters", payout: 300 },
      aqi_spike: { threshold: 400, unit: "AQI", payout: 500 }
    },
    isActive: true
  },
  {
    name: "diamond",
    label: "Diamond",
    description: "Maximum payouts with lower trigger thresholds.",
    multiplier: 1.25,
    coverageDetails: {
      heavy_rain: { threshold: 80, unit: "mm/3hr", payout: 800 },
      extreme_heat: { threshold: 43, unit: "celsius", payout: 650 },
      flood_risk: { threshold: 170, unit: "mm/day", payout: 1500 },
      low_visibility: { threshold: 250, unit: "meters", payout: 450 },
      aqi_spike: { threshold: 360, unit: "AQI", payout: 750 }
    },
    isActive: true
  }
];

const seedPolicyPlans = async () => {
  try {
    // Check if plans already exist
    const existingPlans = await PolicyPlan.countDocuments();
    
    if (existingPlans === 0) {
      console.log("[Migration] Seeding policy plans...");
      const result = await PolicyPlan.insertMany(policyPlansData);
      console.log(`[Migration] ✓ ${result.length} policy plans created in database`);
      return true;
    } else {
      console.log(`[Migration] Policy plans already exist (${existingPlans} found). Skipping seed.`);
      return false;
    }
  } catch (error) {
    console.error("[Migration] ❌ Error seeding policy plans:", error.message);
    throw error;
  }
};

module.exports = { seedPolicyPlans };
