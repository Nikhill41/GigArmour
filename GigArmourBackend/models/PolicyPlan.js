const mongoose = require("mongoose");

const policyPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["bronze", "silver", "diamond"],
      unique: true
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    multiplier: {
      type: Number,
      required: true
    },
    coverageDetails: {
      heavy_rain: {
        threshold: Number,
        unit: String,
        payout: Number
      },
      extreme_heat: {
        threshold: Number,
        unit: String,
        payout: Number
      },
      flood_risk: {
        threshold: Number,
        unit: String,
        payout: Number
      },
      low_visibility: {
        threshold: Number,
        unit: String,
        payout: Number
      },
      aqi_spike: {
        threshold: Number,
        unit: String,
        payout: Number
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PolicyPlan", policyPlanSchema);
