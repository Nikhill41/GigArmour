const payoutService = require("../services/payoutService");

const payoutController = {
  processPayout: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { claimId } = req.params;
      const payout = await payoutService.processClaimPayout(claimId);

      return res.status(200).json({ payout });
    } catch (error) {
      return res.status(500).json({ message: "Payout processing failed" });
    }
  }
};

module.exports = payoutController;
