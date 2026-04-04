import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const cityOptions = ["Mumbai", "Delhi", "Chennai", "Bengaluru", "Mathura", "Pune"];
const conditionOptions = [
  "heavy_rain",
  "extreme_heat",
  "flood_risk",
  "low_visibility",
  "aqi_spike"
];

const thresholds = {
  heavy_rain: 100,
  extreme_heat: 45,
  flood_risk: 200,
  low_visibility: 200,
  aqi_spike: 400
};

const TriggerSimulator = () => {
  const { user } = useAuth();
  const isVisible = user?.role === "admin" || import.meta.env.DEV;
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [condition, setCondition] = useState(conditionOptions[0]);
  const [value, setValue] = useState(thresholds[conditionOptions[0]] + 10);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    setValue(thresholds[condition] + 10);
  }, [condition]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const fetchCities = async () => {
      try {
        setCitiesLoading(true);
        const response = await api.get("/weather/active-cities");
        const list = response.data?.cities || [];
        
        console.log("[TriggerSimulator] Fetched cities:", list);
        
        // Filter only active cities with policies
        const activeCities = list.filter((item) => item.isActive === true);
        
        setCities(activeCities);
        
        // Set first active city as default
        if (activeCities.length > 0) {
          setCity(activeCities[0].name);
          console.log(`[TriggerSimulator] Set default city to: ${activeCities[0].name}`);
        } else {
          console.warn("[TriggerSimulator] No cities with active policies found");
        }
      } catch (error) {
        console.error("[TriggerSimulator] Error loading active cities:", error);
        toast.error("Unable to load active cities");
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [isVisible]);

  const helperText = useMemo(() => {
    if (!summary) {
      return null;
    }

    const claimsCreated = summary.claimsCreated || 0;
    const autoApproved = summary.claimStatuses?.autoApproved || 0;
    const provisional = summary.claimStatuses?.provisional || 0;
    const underReview = summary.claimStatuses?.underReview || 0;

    return `✓ Simulated ${summary.condition} in ${summary.city}: ${claimsCreated} claims created (${autoApproved} approved, ${provisional} provisional, ${underReview} under review)`;
  }, [summary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!city) {
      toast.error("Please select a city");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/weather/simulate", {
        city,
        condition,
        value: Number(value)
      });

      const data = response.data;
      const claimsCreated = data.results?.claimsCreated || 0;
      
      setSummary({
        city,
        condition,
        claimsCreated,
        claimStatuses: data.results?.claimStatuses || {}
      });

      if (claimsCreated > 0) {
        toast.success(`✓ ${claimsCreated} claim(s) created!`);
      } else {
        toast.error("No claims created - check thresholds");
      }

      console.log("[TriggerSimulator] Simulation result:", data);
    } catch (error) {
      console.error("[TriggerSimulator] Simulation error:", error);
      toast.error(error.response?.data?.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Trigger simulator</h3>
      <p className="mt-2 text-sm text-slate-500">
        Simulate a weather disruption and watch auto-claims flow.
      </p>
      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            City with Active Policies
          </label>
          <select
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm w-full"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            disabled={citiesLoading || cities.length === 0}
          >
            <option value="">
              {citiesLoading ? "Loading cities..." : cities.length === 0 ? "No active policies found" : "Select a city"}
            </option>
            {cities
              .filter(option => option.isActive === true)
              .map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name} ({option.activePolicies || 1} policy)
                </option>
              ))}
          </select>
          {cities.length === 0 && !citiesLoading && (
            <p className="text-xs text-amber-600 mt-1">⚠ No cities with active policies. Purchase a policy first!</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Weather Condition
          </label>
          <select
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm w-full"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            {conditionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Value (must exceed threshold)
          </label>
          <input
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm w-full"
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || city === "" || cities.length === 0}
        >
          {loading ? "Simulating..." : "Run simulation"}
        </button>
      </form>
      {helperText ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {helperText}
        </div>
      ) : null}
    </div>
  );
};

export default TriggerSimulator;
