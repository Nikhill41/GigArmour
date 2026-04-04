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
  const [city, setCity] = useState(cityOptions[0]);
  const [condition, setCondition] = useState(conditionOptions[0]);
  const [value, setValue] = useState(thresholds[conditionOptions[0]] + 10);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(thresholds[condition] + 10);
  }, [condition]);

  const helperText = useMemo(() => {
    if (!summary) {
      return null;
    }

    return `Simulated ${summary.condition} in ${summary.city}: ${summary.claimsCreated} claims filed, ${summary.autoApproved} auto-approved, ${summary.underReview} under review`;
  }, [summary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/weather/simulate", {
        city,
        condition,
        value: Number(value)
      });

      const result = response.data?.summary;
      setSummary({
        ...result,
        city,
        condition
      });
      toast.success("Simulation complete");
    } catch (error) {
      toast.error("Unable to run simulation");
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
        <select
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
        >
          {conditionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          disabled={loading}
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
