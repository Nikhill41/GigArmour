const Razorpay = require("razorpay");

const Claim = require("../models/Claim");

let razorpay = null;

const initializeRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

const processClaimPayout = async (claimId) => {
  const razorpayInstance = initializeRazorpay();
  if (!razorpayInstance) {
    console.warn("[PayoutService] Razorpay is not configured, skipping payout");
    return { message: "Razorpay not configured", claim: null };
  }

  const claim = await Claim.findById(claimId).populate("userId");
  if (!claim) {
    throw new Error("Claim not found");
  }

  if (!claim.userId) {
    throw new Error("Claim user not found");
  }

  if (claim.razorpayPayoutId || claim.payoutSentAt) {
    return { message: "Payout already processed", claim };
  }

  if (!process.env.RAZORPAY_ACCOUNT_NUMBER) {
    throw new Error("RAZORPAY_ACCOUNT_NUMBER is missing");
  }

  let payoutAmount = 0;
  if (claim.status === "approved") {
    payoutAmount = claim.payoutAmount;
  } else if (claim.status === "provisional") {
    payoutAmount = Math.floor(claim.payoutAmount * 0.7);
  } else {
    throw new Error("Claim status not eligible for payout");
  }

  if (!payoutAmount || payoutAmount <= 0) {
    throw new Error("Invalid payout amount");
  }

  const contact = await razorpayInstance.contacts.create({
    name: claim.userId.name,
    contact: claim.userId.phone,
    type: "customer",
    reference_id: `user_${claim.userId._id}`
  });

  const vpaAddress = `${claim.userId.phone}@upi`;
  const fundAccount = await razorpayInstance.fundAccount.create({
    contact_id: contact.id,
    account_type: "vpa",
    vpa: {
      address: vpaAddress
    }
  });

  const payout = await razorpayInstance.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account_id: fundAccount.id,
    amount: payoutAmount * 100,
    currency: "INR",
    mode: "UPI",
    purpose: "payout"
  });

  claim.razorpayPayoutId = payout.id;
  claim.payoutSentAt = new Date();
  await claim.save();

  return payout;
};

module.exports = {
  processClaimPayout
};
