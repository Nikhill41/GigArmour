import { useEffect, useMemo, useState } from "react";

import api from "../api/axios";
import Navbar from "../components/Navbar";

const triggerLabels = {
  heavy_rain: "Heavy rain",
  extreme_heat: "Extreme heat",
  flood_risk: "Flood risk",
  low_visibility: "Low visibility",
  aqi_spike: "AQI spike"
};

const formatDate = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
};

const PolicyPage = () => {
  const [activePolicy, setActivePolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPolicy = async () => {
      try {
        const response = await api.get("/policies/active");
        if (!isMounted) {
          return;
        }
        setActivePolicy(response.data?.policy || response.data || null);
      } catch (error) {
        console.error("Policy fetch error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPolicy();
    return () => {
      isMounted = false;
    };
  }, []);

  const coverageRows = useMemo(() => {
    if (!activePolicy?.coverageDetails) {
      return [];
    }

    return Object.keys(activePolicy.coverageDetails).map((key) => ({
      key,
      label: triggerLabels[key] || key,
      threshold: activePolicy.coverageDetails[key]?.threshold,
      unit: activePolicy.coverageDetails[key]?.unit,
      payout: activePolicy.coverageDetails[key]?.payout
    }));
  }, [activePolicy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Your policy</h2>
          <p className="mt-3 text-slate-600">Review your weekly coverage and premium details.</p>
          {loading ? (
            <div className="mt-6 h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : activePolicy ? (
            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Week range</p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatDate(activePolicy.weekStartDate)} - {formatDate(activePolicy.weekEndDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Premium</p>
                  <p className="mt-2 text-lg font-semibold">Rs {activePolicy.premium}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Plan</p>
                  <p className="mt-2 text-lg font-semibold capitalize">
                    {activePolicy.plan || "--"}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="pb-3">Trigger</th>
                      <th className="pb-3">Threshold</th>
                      <th className="pb-3">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {coverageRows.map((row) => (
                      <tr key={row.key}>
                        <td className="py-3 font-medium text-slate-800">{row.label}</td>
                        <td className="py-3 text-slate-500">
                          {row.threshold} {row.unit}
                        </td>
                        <td className="py-3 text-slate-900">Rs {row.payout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              No active policy yet. Purchase coverage to see details here.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PolicyPage;
