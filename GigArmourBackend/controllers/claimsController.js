const Claim = require("../models/Claim");
const User = require("../models/User");
const payoutService = require("../services/payoutService");
const triggerEngine = require("../services/triggerEngine");

const claimsController = {
  getMyClaims: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const claims = await Claim.find({ userId }).sort({ createdAt: -1 });
      
      // Calculate balance from approved and provisional claims
      let approvedBalance = 0;
      let provisionalBalance = 0;
      let underReviewBalance = 0;
      let totalClaimsCount = 0;
      
      claims.forEach((claim) => {
        if (claim.status === "approved") {
          approvedBalance += claim.payoutAmount || 0;
        } else if (claim.status === "provisional") {
          // Provisional claims are 70% of the payout
          provisionalBalance += Math.floor((claim.payoutAmount || 0) * 0.7);
        } else if (claim.status === "under_review") {
          // Under review shows potential payout
          underReviewBalance += claim.payoutAmount || 0;
        }
        totalClaimsCount++;
      });
      
      const totalAvailableBalance = approvedBalance + provisionalBalance;
      
      console.log(`[ClaimsController] User ${userId}: ${totalClaimsCount} claims, approved=₹${approvedBalance}, provisional=₹${provisionalBalance}, under_review=₹${underReviewBalance}`);
      
      return res.status(200).json({ 
        claims,
        balance: {
          approvedBalance,
          provisionalBalance,
          underReviewBalance,
          totalAvailableBalance,
          totalClaimsCount
        }
      });
    } catch (error) {
      console.error("[ClaimsController] Error fetching claims:", error);
      return res.status(500).json({ message: "Unable to fetch claims" });
    }
  },
  manualCheck: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { lat, lon } = req.body || {};
      const coords = lat && lon ? { lat: Number(lat), lon: Number(lon) } : null;
      if (coords) {
        await User.findByIdAndUpdate(
          userId,
          { location: { lat: coords.lat, lon: coords.lon } },
          { new: false }
        );
      }
      const result = await triggerEngine.checkTriggersForUser(userId, coords);

      if (result.triggered === false && result.claims?.length === 0) {
        return res.status(200).json({
          triggered: false,
          message: "No active policy. Buy coverage first.",
          weatherSnapshot: result.weatherSnapshot
        });
      }

      if (!result.triggered) {
        return res.status(200).json({
          triggered: false,
          message: "All clear! No disruptions in your area.",
          weatherSnapshot: result.weatherSnapshot
        });
      }

      return res.status(200).json({
        triggered: true,
        claims: result.claims,
        weatherSnapshot: result.weatherSnapshot
      });
    } catch (error) {
      return res.status(500).json({ message: "Manual trigger check failed" });
    }
  },
  appealClaim: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { claimId } = req.params;
      const { appealNote, photoUrl } = req.body;

      if (!appealNote) {
        return res.status(400).json({ message: "Appeal note is required" });
      }

      const claim = await Claim.findOne({ _id: claimId, userId });
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      if (!["under_review", "rejected"].includes(claim.status)) {
        return res.status(400).json({ message: "Claim is not eligible for appeal" });
      }

      const newFlags = claim.fraudFlags || [];
      newFlags.push(`APPEALED: ${appealNote}`);
      if (photoUrl) {
        newFlags.push(`PHOTO: ${photoUrl}`);
      }

      claim.status = "pending";
      claim.fraudFlags = newFlags;
      await claim.save();

      return res.status(200).json({ claim });
    } catch (error) {
      return res.status(500).json({ message: "Unable to appeal claim" });
    }
  },
  getAllClaims: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { status, triggerType, dateFrom, dateTo } = req.query;
      const filters = {};

      if (status) {
        filters.status = status;
      }

      if (triggerType) {
        filters.triggerType = triggerType;
      }

      if (dateFrom || dateTo) {
        filters.createdAt = {};
        if (dateFrom) {
          filters.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          filters.createdAt.$lte = new Date(dateTo);
        }
      }

      const claims = await Claim.find(filters)
        .populate("userId")
        .populate("policyId")
        .sort({ createdAt: -1 });

      return res.status(200).json({ claims });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch claims" });
    }
  },
  adminUpdateClaimStatus: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { claimId } = req.params;
      const { status, fraudFlag } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      claim.status = status;
      if (fraudFlag) {
        claim.fraudFlags = [...(claim.fraudFlags || []), fraudFlag];
      }

      await claim.save();

      if (status === "approved") {
        await payoutService.processClaimPayout(claim._id);
      }

      return res.status(200).json({ claim });
    } catch (error) {
      return res.status(500).json({ message: "Unable to update claim" });
    }
  }
};

module.exports = claimsController;
