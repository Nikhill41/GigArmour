const Policy = require("../models/Policy");
const RiskProfile = require("../models/RiskProfile");
const User = require("../models/User");
const premiumEngine = require("../services/premiumEngine");

const policyController = {
  purchasePolicy: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        city,
        pincode,
        platform,
        averageDailyDeliveries,
        workHoursPerDay,
        lat,
        lon
      } = req.body;

      if (
        !city ||
        !pincode ||
        !platform ||
        averageDailyDeliveries === undefined ||
        workHoursPerDay === undefined
      ) {
        return res.status(400).json({
          message: "city, pincode, platform, averageDailyDeliveries, workHoursPerDay required"
        });
      }

      if (lat === undefined || lon === undefined) {
        return res.status(400).json({ message: "Location permission required" });
      }

      const today = new Date();
      const existingPolicy = await Policy.findOne({
        userId,
        status: "active",
        weekEndDate: { $gt: today }
      });

      if (existingPolicy) {
        return res.status(400).json({
          message: "You already have an active policy this week"
        });
      }

      await User.findByIdAndUpdate(
        userId,
        {
          city,
          pincode,
          platform,
          averageDailyDeliveries: Number(averageDailyDeliveries),
          workHoursPerDay: Number(workHoursPerDay),
          location: { lat: Number(lat), lon: Number(lon) }
        },
        { new: true }
      );

      const riskProfile = await premiumEngine.calculateRiskProfile(userId);

      const weekStartDate = new Date();
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      const policy = await Policy.create({
        userId,
        weekStartDate,
        weekEndDate,
        premium: riskProfile.weeklyPremium,
        riskTier: riskProfile.riskTier,
        status: "active",
        coverageDetails: {
          heavy_rain: { threshold: 100, unit: "mm/3hr", payout: 500 },
          extreme_heat: { threshold: 45, unit: "celsius", payout: 400 },
          flood_risk: { threshold: 200, unit: "mm/day", payout: 1000 },
          low_visibility: { threshold: 200, unit: "meters", payout: 300 },
          aqi_spike: { threshold: 400, unit: "AQI", payout: 500 }
        }
      });

      return res.status(201).json({ policy });
    } catch (error) {
      return res.status(500).json({ message: "Unable to purchase policy" });
    }
  },
  getMyPolicies: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const policies = await Policy.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({ policies });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch policies" });
    }
  },
  getActivePolicy: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const today = new Date();
      const policy = await Policy.findOne({
        userId,
        status: "active",
        weekEndDate: { $gt: today }
      }).sort({ weekEndDate: -1 });

      return res.status(200).json({ policy });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch active policy" });
    }
  },
  getActivePolicyCount: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const today = new Date();
      const count = await Policy.countDocuments({
        status: "active",
        weekEndDate: { $gt: today }
      });

      return res.status(200).json({ count });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch active policy count" });
    }
  }
};

module.exports = policyController;
