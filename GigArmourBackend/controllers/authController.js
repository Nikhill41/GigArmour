const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const EmailOtp = require("../models/EmailOtp");
const RiskProfile = require("../models/RiskProfile");
const premiumEngine = require("../services/premiumEngine");
const emailService = require("../services/emailService");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const authController = {
  requestOtp: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await EmailOtp.findOneAndUpdate(
        { email: normalizedEmail },
        { email: normalizedEmail, otpHash, expiresAt },
        { upsert: true, new: true }
      );

      await emailService.sendOtpEmail(normalizedEmail, otp);
      return res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
      return res.status(500).json({ message: "Unable to send OTP" });
    }
  },
  register: async (req, res) => {
    try {
      const { name, email, phone, password, otp } = req.body;

      if (!name || !email || !password || !otp) {
        return res.status(400).json({ message: "Name, email, password, OTP required" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      if (phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(409).json({ message: "Phone number already registered" });
        }
      }

      const otpEntry = await EmailOtp.findOne({ email: normalizedEmail });
      if (!otpEntry || otpEntry.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "OTP expired or missing" });
      }

      const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
      if (otpHash !== otpEntry.otpHash) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        phone: phone || undefined,
        passwordHash,
        role: "rider"
      });

      await EmailOtp.deleteOne({ email: normalizedEmail });

      const token = signToken(user);
      const safeUser = user.toObject();
      delete safeUser.passwordHash;

      return res.status(201).json({ token, user: safeUser });
    } catch (error) {
      return res.status(500).json({ message: "Registration failed" });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email: email.trim().toLowerCase() });
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
    try {
      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      delete user.passwordHash;
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch profile" });
    }
  },
  getRiskProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.city) {
        return res.status(200).json({
          riskProfile: null,
          message: "Complete your profile during policy purchase"
        });
      }

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
