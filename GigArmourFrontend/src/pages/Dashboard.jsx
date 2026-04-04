import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const statusBadge = {
  approved: "bg-emerald-100 text-emerald-700",
  provisional: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  rejected: "bg-rose-100 text-rose-700",
  under_review: "bg-orange-100 text-orange-700"
};

const tierStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700"
};

const triggerLabels = {
  heavy_rain: "Heavy rain",
  extreme_heat: "Extreme heat",
  flood_risk: "Flood risk",
  low_visibility: "Low visibility",
  aqi_spike: "AQI spike"
};

const triggerIcons = {
  heavy_rain: "HR",
  extreme_heat: "EH",
  flood_risk: "FR",
  low_visibility: "LV",
  aqi_spike: "AQ"
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

const Dashboard = () => {
  const { user } = useAuth();
  const [activePolicy, setActivePolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [riskProfile, setRiskProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [policyRes, claimsRes, riskRes] = await Promise.all([
          api.get("/policy/active"),
          api.get("/claims/my-claims"),
          api.get("/auth/risk-profile")
        ]);

        if (!isMounted) {
          return;
        }

        setActivePolicy(policyRes.data?.policy || policyRes.data || null);
        setClaims(claimsRes.data?.claims || claimsRes.data || []);
        setRiskProfile(riskRes.data?.riskProfile || riskRes.data || null);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const riskTier = riskProfile?.riskTier || "medium";
  const weeklyPremium = riskProfile?.weeklyPremium;
  const riskScore = riskProfile?.riskScore ?? 0;
  const riskProgress = Math.min(100, Math.max(0, riskScore));

  const coverageRows = useMemo(() => {
    const coverage = activePolicy?.coverageDetails || {};
    const defaults = {
      heavy_rain: { threshold: 100, unit: "mm/3hr", payout: 500 },
      extreme_heat: { threshold: 45, unit: "celsius", payout: 400 },
      flood_risk: { threshold: 200, unit: "mm/day", payout: 1000 },
      low_visibility: { threshold: 200, unit: "meters", payout: 300 },
      aqi_spike: { threshold: 400, unit: "AQI", payout: 500 }
    };

    return Object.keys(defaults).map((key) => ({
      key,
      label: triggerLabels[key],
      threshold: coverage[key]?.threshold ?? defaults[key].threshold,
      unit: coverage[key]?.unit ?? defaults[key].unit,
      payout: coverage[key]?.payout ?? defaults[key].payout
    }));
  }, [activePolicy]);

  const recentClaims = claims.slice(0, 5);

  const fetchActivePolicy = async () => {
    const response = await api.get("/policy/active");
    setActivePolicy(response.data?.policy || response.data || null);
  };

  const handleBuyCoverage = async () => {
    setIsBuying(true);
    try {
      const res = await api.post("/policy/purchase");
      const policy = res.data?.policy || res.data;
      setActivePolicy(policy || null);
      toast.success(`Coverage active! ₹${policy?.premium ?? "--"} deducted.`);
      await fetchActivePolicy();
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed. Try again.");
    } finally {
      setIsBuying(false);
    }
  };

  const handleWeatherCheck = async () => {
    setIsChecking(true);
    try {
      const res = await api.post("/claims/manual-check");
      if (res.data.triggered) {
        toast.success(
          `⚠️ Disruption detected! Claim filed for ₹${res.data.claims[0].payoutAmount}`
        );
        const claimsRes = await api.get("/claims/my-claims");
        setClaims(claimsRes.data?.claims || claimsRes.data || []);
      } else {
        toast.success(`✅ ${res.data.message}`);
      }

      setWeatherSnapshot(res.data.weatherSnapshot);
    } catch (error) {
      toast.error("Weather check failed. Check your connection.");
    } finally {
      setIsChecking(false);
    }
  };

  const policyStatus = activePolicy ? "Active" : "Inactive";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Hello {user?.name || "Rider"}!</p>
                <h2 className="text-2xl font-semibold">
                  Your GigArmour is {policyStatus}
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  activePolicy ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {policyStatus}
              </span>
            </div>

            {activePolicy ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Week range</p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatDate(activePolicy.weekStartDate)} - {formatDate(activePolicy.weekEndDate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Premium paid</p>
                  {loading ? (
                    <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-lg font-semibold">
                      ₹{weeklyPremium ?? "--"}/week
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Risk tier</p>
                  {loading ? (
                    <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-lg font-semibold capitalize">{riskTier}</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                onClick={handleBuyCoverage}
                disabled={isBuying}
              >
                {isBuying ? "Activating..." : "Buy This Week's Coverage"}
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Risk profile</h3>
              {loading ? (
                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
              ) : (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    tierStyles[riskTier] || tierStyles.medium
                  }`}
                >
                  {riskTier}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-500">Weekly premium</p>
            {loading ? (
              <div className="mt-3 h-7 w-28 animate-pulse rounded-full bg-slate-100" />
            ) : (
              <p className="text-2xl font-semibold">₹{weeklyPremium ?? "--"}/week</p>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{riskProfile?.city || user?.city || "City"}</span>
                <span>{riskProfile?.riskScore ?? 0}/100</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${riskProfile?.riskScore ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active policy coverage</h3>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold"
              onClick={handleWeatherCheck}
              disabled={loading || isChecking}
            >
              {isChecking ? "Checking..." : "Check My Weather Now"}
            </button>
          </div>
          {weatherSnapshot ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              🌧 Rain: {weatherSnapshot.rainIntensity?.toFixed(2) ?? "--"}mm/hr ·
              🌡 Temp: {weatherSnapshot.temperature?.toFixed(1) ?? "--"}°C ·
              👁 Visibility: {Math.round(weatherSnapshot.visibility ?? 0)}m ·
              💨 AQI: {Math.round(weatherSnapshot.finalAQI ?? 0)}
            </div>
          ) : null}
          <div className="mt-4 overflow-x-auto">
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
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent claims</h3>
            <span className="text-sm text-slate-500">Last 5</span>
          </div>
          <div className="mt-4 grid gap-3">
            {recentClaims.length === 0 ? (
              <p className="text-sm text-slate-500">No claims filed yet.</p>
            ) : (
              recentClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                      {triggerIcons[claim.triggerType] || "TR"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {triggerLabels[claim.triggerType] || claim.triggerType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(claim.createdAt)} · Rs {claim.payoutAmount}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusBadge[claim.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {claim.status.replace("_", " ")}
                    </span>
                    {claim.fraudFlags?.length ? (
                      <p className="text-xs text-slate-400">
                        {claim.fraudFlags.slice(0, 2).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
