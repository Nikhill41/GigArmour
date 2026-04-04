const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  city: { type: String, trim: true },
  pincode: { type: String },
  platform: {
    type: String,
    enum: ["Zomato", "Swiggy", "Amazon", "Zepto", "Blinkit"],
    required: false
  },
  averageDailyDeliveries: { type: Number },
  workHoursPerDay: { type: Number },
  location: {
    lat: { type: Number },
    lon: { type: Number }
  },
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
