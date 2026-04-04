import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const WeatherTriggerPanel = () => {
  const [activeCities, setActiveCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("heavy_rain");
  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [result, setResult] = useState(null);

  const conditions = [
    { id: "heavy_rain", label: "Heavy Rain", unit: "mm/3hr" },
    { id: "extreme_heat", label: "Extreme Heat", unit: "°C" },
    { id: "flood_risk", label: "Flood Risk", unit: "mm/day" },
    { id: "low_visibility", label: "Low Visibility", unit: "meters" },
    { id: "aqi_spike", label: "AQI Spike", unit: "AQI" }
  ];

  useEffect(() => {
    const fetchActiveCities = async () => {
      try {
        setLoading(true);
        const response = await api.get("/weather/active-cities");
        const citiesWithPolicies = response.data?.cities || [];
        setActiveCities(citiesWithPolicies);
        
        // Auto-select first city with active policy
        const activeCity = citiesWithPolicies.find(c => c.isActive);
        if (activeCity) {
          setSelectedCity(activeCity.name);
        }
        
        console.log(`[WeatherTriggerPanel] Loaded ${citiesWithPolicies.length} cities, ${citiesWithPolicies.filter(c => c.isActive).length} active`);
      } catch (error) {
        console.error("Error fetching active cities:", error);
        toast.error("Failed to load cities with active policies");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCities();
  }, []);

  const handleTriggerWeather = async () => {
    if (!selectedCity) {
      toast.error("Please select a city");
      return;
    }

    if (!selectedValue) {
      toast.error("Please enter a value");
      return;
    }

    try {
      setTriggering(true);
      setResult(null);

      const response = await api.post("/weather/simulate", {
        city: selectedCity,
        condition: selectedCondition,
        value: Number(selectedValue)
      });

      const data = response.data;
      setResult(data);

      if (data.results?.claimsCreated > 0) {
        toast.success(`✓ ${data.results.claimsCreated} claim(s) created!`);
      } else {
        toast.error("No claims created - check diagnostics");
      }

      console.log("[WeatherTriggerPanel] Trigger result:", data);
    } catch (error) {
      console.error("Weather trigger error:", error);
      toast.error(error.response?.data?.message || "Weather trigger failed");
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
        <p className="text-center text-slate-600">Loading active cities...</p>
      </div>
    );
  }

  const selectedConditionObj = conditions.find(c => c.id === selectedCondition);
  const cityPolicyCounts = {};
  activeCities.forEach(city => {
    if (city.isActive) {
      cityPolicyCounts[city.name] = (cityPolicyCounts[city.name] || 0) + 1;
    }
  });

  return (
    <div className="rounded-2xl border border-slate-200 p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">Weather Trigger Control Panel (Admin)</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* City Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select City with Active Policies
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          >
            <option value="">-- Choose City --</option>
            {activeCities
              .filter(city => city.isActive)
              .map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                  {city.activePolicies > 0 ? ` (${city.activePolicies} policy)` : ""}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {activeCities.filter(c => c.isActive).length} cities have active policies
          </p>
        </div>

        {/* Condition Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Weather Condition
          </label>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          >
            {conditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Value ({selectedConditionObj?.unit || "unit"})
          </label>
          <input
            type="number"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            placeholder="Enter trigger value"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">
            Must exceed threshold to trigger claims
          </p>
        </div>

        {/* Trigger Button */}
        <div className="flex items-end">
          <button
            onClick={handleTriggerWeather}
            disabled={triggering || !selectedCity}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {triggering ? "Triggering..." : "Trigger Weather"}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Trigger Result</h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500">Policies Scanned</p>
              <p className="text-2xl font-bold text-slate-900">{result.results?.policiesScanned || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Claims Created</p>
              <p className="text-2xl font-bold text-emerald-600">{result.results?.claimsCreated || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">City</p>
              <p className="text-lg font-semibold text-slate-900">{result.simulation?.city}</p>
            </div>
          </div>

          {result.results?.claimStatuses && (
            <div className="bg-white p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Claim Statuses:</p>
              <div className="text-sm space-y-1">
                {Object.entries(result.results.claimStatuses).map(([status, count]) => (
                  <p key={status} className="text-slate-700">
                    {status.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-semibold">{count}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {result.results?.claimedUsers && result.results.claimedUsers.length > 0 && (
            <div className="mt-3 bg-white p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Affected Users:</p>
              <div className="space-y-1">
                {result.results.claimedUsers.map((user, idx) => (
                  <p key={idx} className="text-xs text-slate-600">
                    {user.user_email} - {user.claims_created} claim(s)
                  </p>
                ))}
              </div>
            </div>
          )}

          {result.diagnostics && (
            <div className="mt-3 bg-amber-50 p-3 rounded border border-amber-200">
              <p className="text-xs text-amber-900 font-semibold">⚠ No Claims Created</p>
              <p className="text-xs text-amber-700 mt-1">{result.diagnostics.warning}</p>
              <p className="text-xs text-amber-700 mt-2 font-semibold">Next steps:</p>
              <ul className="text-xs text-amber-700 space-y-1 mt-1">
                {result.diagnostics.nextSteps.map((step, idx) => (
                  <li key={idx} className="ml-2">• {step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Available Cities List */}
      {activeCities.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-2">All Cities</h4>
          <div className="flex flex-wrap gap-2">
            {activeCities.map((city) => (
              <span
                key={city.name}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  city.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {city.name}
                {city.isActive && ` (${city.activePolicies})`}
                {city.isActive && " ✓"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherTriggerPanel;
