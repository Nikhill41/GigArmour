const Policy = require("../models/Policy");
const PolicyPlan = require("../models/PolicyPlan");
const RiskProfile = require("../models/RiskProfile");
const User = require("../models/User");
const premiumEngine = require("../services/premiumEngine");

const policyController = {
  getAvailablePlans: async (req, res) => {
    try {
      const plans = await PolicyPlan.find({ isActive: true }).sort({ updatedAt: 1 });
      console.log(`[PolicyController] Fetching available plans: ${plans.length} plans found`);
      return res.status(200).json({ plans });
    } catch (error) {
      console.error("Error fetching available plans:", error);
      return res.status(500).json({ message: "Unable to fetch available plans" });
    }
  },
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
        lon,
        plan
      } = req.body;

      if (
        !city ||
        !pincode ||
        !platform ||
        averageDailyDeliveries === undefined ||
        workHoursPerDay === undefined ||
        !plan
      ) {
        return res.status(400).json({
          message:
            "city, pincode, platform, averageDailyDeliveries, workHoursPerDay, plan required"
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

      console.log(`[PolicyController] Purchasing policy for user ${userId} in ${city}`);

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

      // Fetch plan from database instead of hardcoded config
      const selectedPlan = await PolicyPlan.findOne({ 
        name: String(plan).toLowerCase(),
        isActive: true 
      });

      if (!selectedPlan) {
        return res.status(400).json({ message: "Invalid plan selection" });
      }

      const premium = Math.round(riskProfile.weeklyPremium * selectedPlan.multiplier);

      const weekStartDate = new Date();
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 7);

      const policy = await Policy.create({
        userId,
        weekStartDate,
        weekEndDate,
        premium,
        plan: String(plan).toLowerCase(),
        riskTier: riskProfile.riskTier,
        status: "active",
        coverageDetails: selectedPlan.coverageDetails
      });

      console.log(`[PolicyController] ✓ Policy created: ${policy._id}, premium: ₹${premium}`);

      // FIX: Return proper response with policy object
      return res.status(201).json({ 
        message: "Policy purchased successfully",
        policy: policy.toObject() 
      });
    } catch (error) {
      console.error(`[PolicyController] ❌ Error: ${error.message}`);
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
      const today = new Date();
      
      // FIX: Mark policies with active status
      const enrichedPolicies = policies.map(p => ({
        ...p.toObject(),
        isActive: p.status === "active" && p.weekEndDate > today
      }));
      
      return res.status(200).json({ policies: enrichedPolicies });
    } catch (error) {
      console.error("Error fetching policies:", error);
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

      console.log(`[PolicyController] getActivePolicy for user ${userId}: ${policy ? `Found ${policy._id} (${policy.plan})` : "No active policy"}`);

      // FIX: Return null explicitly when no policy found (not undefined)
      return res.status(200).json({ policy: policy || null });
    } catch (error) {
      console.error("Error fetching active policy:", error);
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
  },
  estimatePremium: async (req, res) => {
    try {
      const { city, plan } = req.body;

      if (!city) {
        return res.status(400).json({ message: "City is required" });
      }

      // City risk mapping (same as premiumEngine.js)
      const cityRiskMap = {
        Mumbai: 0.9,
        Delhi: 0.85,
        Chennai: 0.75,
        Kolkata: 0.8,
        Bengaluru: 0.6,
        Bangalore: 0.6,
        Pune: 0.55,
        Jaipur: 0.65,
        Mathura: 0.55,
        Lucknow: 0.7,
        Kanpur: 0.75,
        Agra: 0.6,
        Meerut: 0.65,
        Kheri: 0.55,
        Lakhimpur: 0.55,
        Noida: 0.7,
        Ghaziabad: 0.7,
        Varanasi: 0.65,
        Allahabad: 0.65,
        Prayagraj: 0.65,
        Hyderabad: 0.65,
        Ahmedabad: 0.6,
        Surat: 0.65,
        Bhopal: 0.55
      };

      const cityRiskValue = cityRiskMap[city] ?? cityRiskMap[city?.trim()] ?? 0.5;
      const riskScore = Math.round(cityRiskValue * 100);
      
      // Base premium rates based on risk tier
      const riskTier = riskScore <= 35 ? "low" : riskScore <= 65 ? "medium" : "high";
      const premiumMap = { low: 20, medium: 40, high: 70 };
      const weeklyPremium = premiumMap[riskTier] || 40;

      console.log(`[PolicyController] Estimated premium for ${city}: riskScore=${riskScore}, tier=${riskTier}, baseWeekly=₹${weeklyPremium}`);

      return res.status(200).json({
        city,
        riskScore,
        riskTier,
        weeklyPremium,
        plan
      });
    } catch (error) {
      console.error("Error estimating premium:", error);
      return res.status(500).json({ message: "Unable to estimate premium" });
    }
  }
};

module.exports = policyController;
