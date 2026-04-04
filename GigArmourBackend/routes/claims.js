const express = require("express");
const claimsController = require("../controllers/claimsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-claims", protect, claimsController.getMyClaims);
router.post("/manual-check", protect, claimsController.manualCheck);
router.post("/:claimId/appeal", protect, claimsController.appealClaim);
router.get("/all", protect, claimsController.getAllClaims);
router.patch("/:claimId/status", protect, claimsController.adminUpdateClaimStatus);

module.exports = router;
