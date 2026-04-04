const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true },
  platform: {
    type: String,
    enum: ["Zomato", "Swiggy", "Amazon", "Zepto", "Blinkit"],
    required: true
  },
  averageDailyDeliveries: { type: Number, required: true },
  workHoursPerDay: { type: Number, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["rider", "admin"], default: "rider" },
  createdAt: { type: Date, default: Date.now }
});

userSchema.virtual("isNewWorker").get(function () {
  if (!this.createdAt) {
    return false;
  }

  const ageMs = Date.now() - this.createdAt.getTime();
  return ageMs < 28 * 24 * 60 * 60 * 1000;
});

module.exports = mongoose.model("User", userSchema);
