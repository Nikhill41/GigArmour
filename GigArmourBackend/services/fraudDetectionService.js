const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const payoutService = require("./payoutService");

const calculateFraudRiskScore = async (claim, user) => {
  const flags = [];
  let score = 0;

  const now = new Date();
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);

  const last24Hours = new Date(now);
  last24Hours.setHours(last24Hours.getHours() - 24);

  const claimTime = claim.createdAt || now;
  const windowStart = new Date(claimTime);
  windowStart.setMinutes(windowStart.getMinutes() - 5);
  const windowEnd = new Date(claimTime);
  windowEnd.setMinutes(windowEnd.getMinutes() + 5);

  const [recentClaims, recentPolicies] = await Promise.all([
    Claim.find({
      userId: user._id,
      createdAt: { $gte: last7Days, $lte: now },
      _id: { $ne: claim._id }
    }).select("_id"),
    Policy.find({
      userId: user._id,
      createdAt: { $gte: last7Days, $lte: now }
    }).select("_id")
  ]);

  if (!recentClaims.length && !recentPolicies.length) {
    score += 15;
    flags.push("FIRST_TIME_ZONE");
  }

  if (user.createdAt) {
    const accountAgeMs = now.getTime() - user.createdAt.getTime();
    if (accountAgeMs < 7 * 24 * 60 * 60 * 1000) {
      score += 10;
      flags.push("NEW_ACCOUNT");
    }
  }

  const claimsLast24Hours = await Claim.countDocuments({
    userId: user._id,
    createdAt: { $gte: last24Hours, $lte: now },
    _id: { $ne: claim._id }
  });

  if (claimsLast24Hours > 2) {
    score += 15;
    flags.push("HIGH_CLAIM_FREQUENCY");
  }

  if (!user.averageDailyDeliveries) {
    score += 10;
    flags.push("NO_DELIVERY_HISTORY");
  }

  const claimsInWindow = await Claim.countDocuments({
    createdAt: { $gte: windowStart, $lte: windowEnd }
  });

  if (claimsInWindow > 50) {
    score += 25;
    flags.push("COORDINATED_ATTACK_SUSPECTED");
  } else if (claimsInWindow > 20) {
    score += 15;
    flags.push("VELOCITY_SPIKE");
  }

  let adjustedScore = Math.min(100, Math.max(0, Math.round(score)));
  if (user.isNewWorker) {
    adjustedScore = Math.max(0, adjustedScore - 10);
    flags.push("NEW_WORKER_TRUST_PERIOD");
  }

  let decision = "under_review";
  if (adjustedScore <= 30) {
    claim.status = "approved";
    decision = "approved";
  } else if (adjustedScore <= 60) {
    claim.status = "provisional";
    flags.push("PROVISIONAL_30_PERCENT_HELD");
    decision = "provisional";
  } else {
    claim.status = "under_review";
    decision = "under_review";
  }

  claim.fraudFlags = [...(claim.fraudFlags || []), ...flags];
  await claim.save();

  if (claim.status === "approved") {
    await payoutService.processClaimPayout(claim._id);
  }

  return {
    riskScore: adjustedScore,
    flags,
    decision
  };
};

module.exports = {
  calculateFraudRiskScore
};
