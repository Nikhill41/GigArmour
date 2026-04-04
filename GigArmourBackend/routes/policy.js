const express = require("express");
const policyController = require("../controllers/policyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/purchase", protect, policyController.purchasePolicy);
router.get("/my-policies", protect, policyController.getMyPolicies);
router.get("/active", protect, policyController.getActivePolicy);
router.get("/active-count", protect, policyController.getActivePolicyCount);

module.exports = router;
