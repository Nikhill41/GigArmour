const weatherService = require("../services/weatherService");
const Policy = require("../models/Policy");
const User = require("../models/User");

const weatherController = {
  getWeatherSnapshot: async (req, res) => {
    return res.status(200).json({ message: "Weather endpoint ready" });
  },
  getCurrentWeather: async (req, res) => {
    try {
      const { city } = req.params;
      const snapshot = await weatherService.getCurrentWeatherByCity(city);
      return res.status(200).json({ snapshot });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch weather" });
    }
  },
  simulateWeather: async (req, res) => {
    try {
      // Allow any authenticated user to simulate weather (not admin-only)
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { city, condition, value } = req.body;
      if (!city || !condition || value === undefined) {
        return res.status(400).json({ 
          message: "city, condition, value required",
          example: {
            city: "Mumbai",
            condition: "heavy_rain",
            value: 120
          }
        });
      }

      console.log(`[WeatherController] User ${req.user.id} simulating weather: city=${city}, condition=${condition}, value=${value}`);

      const summary = await weatherService.simulateWeatherEvent(city, condition, Number(value));
      
      // FIX #4: Return detailed response with diagnostics
      const response = {
        message: "Weather simulation completed",
        simulation: {
          city,
          condition,
          value,
          timestamp: new Date().toISOString()
        },
        results: {
          policiesScanned: summary.usersChecked,
          claimsCreated: summary.claimsCreated,
          claimStatuses: {
            autoApproved: summary.autoApproved,
            provisional: summary.provisional,
            underReview: summary.underReview
          }
        }
      };

      // Add diagnostics if no claims created
      if (summary.claimsCreated === 0 && summary.warning) {
        response.diagnostics = {
          warning: summary.warning,
          nextSteps: [
            `1. Verify user exists with city "${city}"`,
            `2. Check that user has purchased an active policy`,
            `3. Confirm policy hasn't expired (weekEndDate > today)`,
            `4. Ensure city name spelling matches exactly (case-insensitive)`
          ]
        };
      }

      // Include claimed users if any
      if (summary.claimedUsers && summary.claimedUsers.length > 0) {
        response.results.claimedUsers = summary.claimedUsers;
      }

      console.log(`[WeatherController] ✓ Simulation response sent: ${summary.claimsCreated} claims`);
      return res.status(200).json(response);
    } catch (error) {
      console.error(`[WeatherController] ❌ Simulation error: ${error.message}`);
      return res.status(500).json({ 
        message: "Simulation failed",
        error: error.message
      });
    }
  },
  getActivePolicyCities: async (req, res) => {
    try {
      // Allow any authenticated user to see active cities (not admin-only)
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const today = new Date();
      const policies = await Policy.find({
        status: "active",
        weekEndDate: { $gt: today }
      }).populate("userId", "city email");

      const citySet = new Set();
      const cityUserCount = {};
      
      for (const policy of policies) {
        const city = policy.userId?.city;
        if (city) {
          citySet.add(city);
          cityUserCount[city] = (cityUserCount[city] || 0) + 1;
        }
      }

      const allCities = await User.distinct("city", { city: { $exists: true, $ne: "" } });
      const cities = allCities
        .filter(Boolean)
        .map((name) => ({ 
          name, 
          isActive: citySet.has(name),
          activePolicies: cityUserCount[name] || 0
        }))
        .sort((a, b) => {
          // Sort active cities first, then alphabetically
          if (a.isActive !== b.isActive) return b.isActive - a.isActive;
          return a.name.localeCompare(b.name);
        });

      console.log(`[WeatherController] getActivePolicyCities for user ${req.user.id}: ${cities.filter(c => c.isActive).length} cities with active policies`);

      return res.status(200).json({ 
        cities,
        summary: {
          totalCities: cities.length,
          activeCities: cities.filter(c => c.isActive).length,
          totalActivePolicies: Array.from(citySet).reduce((sum, city) => sum + (cityUserCount[city] || 0), 0)
        }
      });
    } catch (error) {
      console.error("[WeatherController] Error fetching active cities:", error);
      return res.status(500).json({ message: "Unable to fetch active cities" });
    }
  }
};

module.exports = weatherController;
