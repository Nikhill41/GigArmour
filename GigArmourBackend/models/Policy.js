const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  premium: { type: Number, required: true },
  riskTier: { type: String, enum: ["low", "medium", "high"], required: true },
  status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  coverageDetails: {
    heavy_rain: {
      threshold: { type: Number },
      unit: { type: String },
      payout: { type: Number }
    },
    extreme_heat: {
      threshold: { type: Number },
      unit: { type: String },
      payout: { type: Number }
    },
    flood_risk: {
      threshold: { type: Number },
      unit: { type: String },
      payout: { type: Number }
    },
    low_visibility: {
      threshold: { type: Number },
      unit: { type: String },
      payout: { type: Number }
    },
    aqi_spike: {
      threshold: { type: Number },
      unit: { type: String },
      payout: { type: Number }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Policy", policySchema);
