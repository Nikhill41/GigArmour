const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const policyRoutes = require("./routes/policy");
const claimsRoutes = require("./routes/claims");
const weatherRoutes = require("./routes/weather");
const payoutRoutes = require("./routes/payout");
const triggerEngine = require("./services/triggerEngine");
const Policy = require("./models/Policy");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "GigArmour backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/payout", payoutRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const checkTriggersForAll = async () => {
    const today = new Date();
    const userIds = await Policy.find({
      status: "active",
      weekEndDate: { $gt: today }
    }).distinct("userId");

    for (const userId of userIds) {
      await triggerEngine.checkTriggersForUser(userId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  cron.schedule("*/30 * * * *", async () => {
    try {
      await checkTriggersForAll();
    } catch (error) {
      console.error("Trigger check failed:", error.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
