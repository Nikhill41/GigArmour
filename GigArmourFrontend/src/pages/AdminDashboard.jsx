import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import api from "../api/axios";
import Navbar from "../components/Navbar";

const statusColors = {
  approved: "#16a34a",
  provisional: "#f59e0b",
  under_review: "#f97316",
  rejected: "#ef4444"
};

const triggerLabels = {
  heavy_rain: "Heavy rain",
  extreme_heat: "Extreme heat",
  flood_risk: "Flood risk",
  low_visibility: "Low visibility",
  aqi_spike: "AQI spike"
};

const statusBadges = {
  approved: "bg-emerald-100 text-emerald-700",
  provisional: "bg-amber-100 text-amber-700",
  under_review: "bg-orange-100 text-orange-700",
  rejected: "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-600"
};

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [activePolicyCount, setActivePolicyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [triggerFilter, setTriggerFilter] = useState("all");

  const fetchClaims = async () => {
    const response = await api.get("/claims/all");
    return response.data?.claims || [];
  };

  const fetchActivePolicyCount = async () => {
    const response = await api.get("/policies/active-count");
    return response.data?.count || 0;
  };

  const refreshClaims = async () => {
    const latest = await fetchClaims();
    setClaims(latest);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [claimsData, activePolicyCountData] = await Promise.all([
          fetchClaims(),
          fetchActivePolicyCount()
        ]);

        if (!isMounted) {
          return;
        }

        setClaims(claimsData);
        setActivePolicyCount(activePolicyCountData);
      } catch (error) {
        if (isMounted) {
          toast.error("Unable to load admin data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const todayRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }, []);

  const totalClaimsToday = claims.filter((claim) => {
    const createdAt = new Date(claim.createdAt);
    return createdAt >= todayRange.start && createdAt < todayRange.end;
  }).length;

  const totalPayoutsSent = claims
    .filter((claim) => claim.payoutSentAt)
    .reduce((sum, claim) => sum + (claim.payoutAmount || 0), 0);

  const claimsUnderReview = claims.filter((claim) => claim.status === "under_review").length;

  const statusChartData = [
    "approved",
    "provisional",
    "under_review",
    "rejected"
  ].map((status) => ({
    name: status.replace("_", " "),
    value: claims.filter((claim) => claim.status === status).length,
    status
  }));

  const triggerChartData = Object.keys(triggerLabels).map((triggerType) => {
    const filtered = claims.filter((claim) => claim.triggerType === triggerType);
    const payoutTotal = filtered.reduce((sum, claim) => sum + (claim.payoutAmount || 0), 0);
    return {
      triggerType,
      label: triggerLabels[triggerType],
      count: filtered.length,
      payoutTotal
    };
  });

  const filteredClaims = claims.filter((claim) => {
    if (statusFilter !== "all" && claim.status !== statusFilter) {
      return false;
    }
    if (triggerFilter !== "all" && claim.triggerType !== triggerFilter) {
      return false;
    }
    return true;
  });

  const fraudClaims = claims.filter((claim) => claim.status === "under_review");

  const handleApprove = async (claimId) => {
    try {
      await api.patch(`/claims/${claimId}/status`, { status: "approved" });
      toast.success("Claim approved and payout initiated");
      await refreshClaims();
    } catch (error) {
      toast.error("Unable to process payout");
    }
  };

  const handleReject = async (claimId) => {
    try {
      await api.patch(`/claims/${claimId}/status`, { status: "rejected" });
      toast.success("Claim rejected");
      await refreshClaims();
    } catch (error) {
      toast.error("Unable to reject claim");
    }
  };

  const handleMarkFraud = async (claimId) => {
    try {
      await api.patch(`/claims/${claimId}/status`, {
        status: "rejected",
        fraudFlag: "FRAUD_MARKED"
      });
      toast.success("Claim marked as fraud");
      await refreshClaims();
    } catch (error) {
      toast.error("Unable to mark fraud");
    }
  };

  const handleClearAndPay = async (claimId) => {
    await handleApprove(claimId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">Active policies</p>
            <p className="mt-2 text-3xl font-semibold">{activePolicyCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">Claims today</p>
            <p className="mt-2 text-3xl font-semibold">{totalClaimsToday}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">Payouts sent</p>
            <p className="mt-2 text-3xl font-semibold">Rs {totalPayoutsSent}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">Under review</p>
            <p className="mt-2 text-3xl font-semibold">{claimsUnderReview}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Claims by status</h3>
              <span className="text-xs text-slate-400">All time</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Trigger breakdown</h3>
              <span className="text-xs text-slate-400">Claims by trigger</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={triggerChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "count") {
                        return [value, "Claims"];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const entry = payload?.[0]?.payload;
                      if (!entry) {
                        return label;
                      }
                      return `${label} | Payout total: Rs ${entry.payoutTotal}`;
                    }}
                  />
                  <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Claims table</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <select
                className="rounded-full border border-slate-200 px-4 py-2"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="provisional">Provisional</option>
                <option value="under_review">Under review</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="rounded-full border border-slate-200 px-4 py-2"
                value={triggerFilter}
                onChange={(event) => setTriggerFilter(event.target.value)}
              >
                <option value="all">All triggers</option>
                {Object.keys(triggerLabels).map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {triggerLabels[trigger]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="pb-3">Worker name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Trigger</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Fraud flags</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim._id}>
                    <td className="py-3 font-medium">{claim.userId?.name || "--"}</td>
                    <td className="py-3 text-slate-600">{claim.userId?.phone || "--"}</td>
                    <td className="py-3 text-slate-600">{claim.userId?.city || "--"}</td>
                    <td className="py-3 text-slate-600">
                      {triggerLabels[claim.triggerType] || claim.triggerType}
                    </td>
                    <td className="py-3 text-slate-900">Rs {claim.payoutAmount}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusBadges[claim.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {claim.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {claim.fraudFlags?.length ? claim.fraudFlags.join(", ") : "--"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(claim._id)}
                          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(claim._id)}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fraud alert panel</h3>
            <span className="text-sm text-slate-500">Under review</span>
          </div>
          <div className="mt-4 grid gap-4">
            {fraudClaims.length === 0 ? (
              <p className="text-sm text-slate-500">No claims under review.</p>
            ) : (
              fraudClaims.map((claim) => (
                <div
                  key={claim._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {claim.userId?.name || "Worker"} · {triggerLabels[claim.triggerType]}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(claim.fraudFlags || []).map((flag) => (
                        <span
                          key={`${claim._id}-${flag}`}
                          className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkFraud(claim._id)}
                      className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                      disabled={loading}
                    >
                      Mark as Fraud
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAndPay(claim._id)}
                      className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                      disabled={loading}
                    >
                      Clear & Pay
                    </button>
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

export default AdminDashboard;
