const mongoose = require("mongoose");

const riskProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  city: { type: String, required: true, trim: true },
  riskScore: { type: Number, min: 0, max: 100, required: true },
  riskTier: { type: String, enum: ["low", "medium", "high"], required: true },
  locationRiskFactor: { type: Number, required: true },
  historicalWeatherRisk: { type: Number, required: true },
  weeklyPremium: { type: Number, required: true },
  lastCalculatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RiskProfile", riskProfileSchema);
