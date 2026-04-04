const express = require("express");
const policyController = require("../controllers/policyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - no authentication needed
router.get("/plans", policyController.getAvailablePlans);
router.post("/estimate-premium", policyController.estimatePremium);

// Protected routes
router.post("/purchase", protect, policyController.purchasePolicy);
router.get("/my-policies", protect, policyController.getMyPolicies);
router.get("/active", protect, policyController.getActivePolicy);
router.get("/active-count", protect, policyController.getActivePolicyCount);

module.exports = router;
