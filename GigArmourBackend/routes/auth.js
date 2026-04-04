const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request-otp", authController.requestOtp);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);
router.get("/risk-profile", protect, authController.getRiskProfile);
router.post("/recalculate-risk", protect, authController.recalculateRiskProfile);

module.exports = router;
