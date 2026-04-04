const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RiskProfile = require("../models/RiskProfile");
const premiumEngine = require("../services/premiumEngine");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const authController = {
  register: async (req, res) => {
    try {
      const {
        name,
        phone,
        city,
        pincode,
        platform,
        averageDailyDeliveries,
        workHoursPerDay,
        password
      } = req.body;

      if (
        !name ||
        !phone ||
        !city ||
        !pincode ||
        !platform ||
        averageDailyDeliveries === undefined ||
        workHoursPerDay === undefined ||
        !password
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(409).json({ message: "Phone number already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        phone,
        city,
        pincode,
        platform,
        averageDailyDeliveries,
        workHoursPerDay,
        passwordHash,
        role: "rider"
      });

      const riskProfile = await premiumEngine.calculateRiskProfile(user._id);
      const token = signToken(user);

      const safeUser = user.toObject();
      delete safeUser.passwordHash;

      return res.status(201).json({
        token,
        user: safeUser,
        riskProfile: {
          weeklyPremium: riskProfile.weeklyPremium,
          riskTier: riskProfile.riskTier
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Registration failed" });
    }
  },
  login: async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password are required" });
      }

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      if (!matches) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user);
      const safeUser = user.toObject();
      delete safeUser.passwordHash;

      return res.status(200).json({ token, user: safeUser });
    } catch (error) {
      return res.status(500).json({ message: "Login failed" });
    }
  },
  me: async (req, res) => {
    return res.status(200).json({ message: "Profile endpoint ready", user: req.user });
  },
  getRiskProfile: async (req, res) => {
    try {
      const profile = await RiskProfile.findOne({ userId: req.user.id });
      if (!profile) {
        const created = await premiumEngine.calculateRiskProfile(req.user.id);
        return res.status(200).json({ riskProfile: created });
      }

      const staleCutoff = Date.now() - 24 * 60 * 60 * 1000;
      if (profile.lastCalculatedAt && profile.lastCalculatedAt.getTime() < staleCutoff) {
        premiumEngine.calculateRiskProfile(req.user.id).catch((error) => {
          console.error("Risk profile refresh failed:", error.message);
        });
      }

      return res.status(200).json({ riskProfile: profile });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch risk profile" });
    }
  },
  recalculateRiskProfile: async (req, res) => {
    try {
      const profile = await premiumEngine.calculateRiskProfile(req.user.id);
      return res.status(200).json({ riskProfile: profile });
    } catch (error) {
      return res.status(500).json({ message: "Unable to recalculate risk profile" });
    }
  }
};

module.exports = authController;
