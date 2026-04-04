const express = require("express");
const payoutController = require("../controllers/payoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/process/:claimId", protect, payoutController.processPayout);

module.exports = router;
