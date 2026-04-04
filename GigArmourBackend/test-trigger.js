require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Policy = require("./models/Policy");
const Claim = require("./models/Claim");
const triggerEngine = require("./services/triggerEngine");

async function testTrigger() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/gigarmour");
    console.log("[Test] Connected to MongoDB");

    // Find first user with active policy
    const user = await User.findOne().exec();
    if (!user) {
      console.log("[Test] No users found");
      process.exit(1);
    }
    console.log("[Test] Found user:", user.email);

    // Find any active policy
    const policy = await Policy.findOne({
      status: "active",
      weekEndDate: { $gt: new Date() }
    }).populate("userId").exec();

    if (!policy) {
      console.log("[Test] No active policies found in database");
      console.log("[Test] Checking all policies...");
      const allPolicies = await Policy.find({}).exec();
      console.log(`[Test] Total policies in database: ${allPolicies.length}`);
      allPolicies.forEach((p, i) => {
        console.log(`  [${i}] userId=${p.userId}, status=${p.status}, weekEndDate=${p.weekEndDate}, expired=${p.weekEndDate < new Date()}`);
      });
      process.exit(1);
    }
    
    // Get the actual user associated with the policy
    const actualUser = policy.userId;
    console.log("[Test] Found policy:", policy._id);
    console.log("[Test] Policy user:", actualUser.email);
    console.log("[Test] Policy coverageDetails:", JSON.stringify(policy.coverageDetails, null, 2));

    // Test weather snapshot with extreme_heat exceeding threshold
    // Bronze plan threshold is 46°C
    const weatherSnapshot = {
      rainIntensity: 0,
      temperature: 48,  // Exceeds bronze threshold of 46
      visibility: 5000,
      finalAQI: 120
    };

    console.log("[Test] Testing weather snapshot:", JSON.stringify(weatherSnapshot));
    console.log("[Test] Calling triggerEngine.evaluateTriggers...");

    const result = await triggerEngine.evaluateTriggers(actualUser._id.toString(), weatherSnapshot);
    console.log("[Test] Result:", JSON.stringify(result, null, 2));

    if (result.claims.length > 0) {
      console.log("[Test] ✓ SUCCESS: Claims created!");
    } else {
      console.log("[Test] ❌ FAILURE: No claims created despite trigger threshold exceeded");
    }

    process.exit(0);
  } catch (error) {
    console.error("[Test] Error:", error);
    process.exit(1);
  }
}

testTrigger();
