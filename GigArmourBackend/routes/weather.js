const express = require("express");
const weatherController = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/snapshot", protect, weatherController.getWeatherSnapshot);
router.get("/current/:city", protect, weatherController.getCurrentWeather);
router.get("/active-cities", protect, weatherController.getActivePolicyCities);
router.post("/simulate", protect, weatherController.simulateWeather);

module.exports = router;
