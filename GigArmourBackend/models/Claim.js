const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
  triggerType: {
    type: String,
    enum: [
      "heavy_rain",
      "extreme_heat",
      "flood_risk",
      "low_visibility",
      "aqi_spike"
    ],
    required: true
  },
  triggerValue: { type: Number, required: true },
  threshold: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "provisional", "approved", "rejected", "under_review"],
    default: "pending"
  },
  riskScore: { type: Number, min: 0, max: 100, required: true },
  fraudFlags: [{ type: String }],
  payoutSentAt: { type: Date },
  razorpayPayoutId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Claim", claimSchema);
