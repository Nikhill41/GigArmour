const weatherService = require("../services/weatherService");

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
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { city, condition, value } = req.body;
      if (!city || !condition || value === undefined) {
        return res.status(400).json({ message: "city, condition, value required" });
      }

      const summary = await weatherService.simulateWeatherEvent(city, condition, Number(value));
      return res.status(200).json({ summary });
    } catch (error) {
      return res.status(500).json({ message: "Simulation failed" });
    }
  }
};

module.exports = weatherController;
