const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const connectDB = require("./config/db");
const { seedPolicyPlans } = require("./migrations/seedPolicyPlans");

const authRoutes = require("./routes/auth");
const policyRoutes = require("./routes/policy");
const claimsRoutes = require("./routes/claims");
const weatherRoutes = require("./routes/weather");
const payoutRoutes = require("./routes/payout");
const triggerEngine = require("./services/triggerEngine");
const Policy = require("./models/Policy");

const app = express();

// CORS Configuration for production
const allowedOrigins = [
  'http://localhost:5173',     // Local development
  'http://localhost:3000',      // Alternative local dev
  'http://localhost:5175',      // Alternative Vite port
  'http://localhost:5176',      // Alternative Vite port
  process.env.FRONTEND_URL,     // Vercel frontend URL (set in Railway env)
  /vercel\.app$/                // Any Vercel preview deployment
].filter(Boolean);

console.log("[CORS] Allowed origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or node-cron)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests for all routes
app.options(/.*/, cors(corsOptions));

// Health check endpoint - for Vercel/Railway monitoring
app.get("/", (req, res) => {
  res.json({ 
    status: "GigArmour backend running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
});

// Health check with database status
app.get("/health", (req, res) => {
  const dbStatus = require("mongoose").connection.readyState;
  res.json({
    status: dbStatus === 1 ? "healthy" : "unhealthy",
    database: dbStatus === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/payout", payoutRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Run migrations
  try {
    await seedPolicyPlans();
  } catch (error) {
    console.error("Migration failed:", error.message);
  }

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
