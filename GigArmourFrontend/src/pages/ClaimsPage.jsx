import { useEffect, useState } from "react";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import ClaimCard from "../components/ClaimCard";
import TriggerSimulator from "../components/TriggerSimulator";

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchClaims = async () => {
      try {
        const response = await api.get("/claims/my-claims");
        if (!isMounted) {
          return;
        }
        setClaims(response.data?.claims || response.data || []);
        setBalance(response.data?.balance || null);
        console.log("[ClaimsPage] Fetched claims with balance:", response.data?.balance);
      } catch (error) {
        console.error("Claims fetch error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClaims();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {/* Balance Summary Card */}
          {balance && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Your GigArmour Balance</h2>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700 font-medium">Approved</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">₹{balance.approvedBalance || 0}</p>
                  <p className="mt-1 text-xs text-emerald-600">{claims.filter(c => c.status === "approved").length} claims</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-700 font-medium">Provisional (70%)</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700">₹{balance.provisionalBalance || 0}</p>
                  <p className="mt-1 text-xs text-amber-600">{claims.filter(c => c.status === "provisional").length} claims</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-700 font-medium">Total Available</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">₹{balance.totalAvailableBalance || 0}</p>
                  <p className="mt-1 text-xs text-slate-600">{balance.totalClaimsCount} total claims</p>
                </div>
              </div>
              {balance.underReviewBalance > 0 && (
                <div className="mt-4 rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-orange-700 font-medium">Under Review (Potential)</p>
                  <p className="mt-2 text-lg font-bold text-orange-700">₹{balance.underReviewBalance || 0}</p>
                  <p className="text-xs text-orange-600">{claims.filter(c => c.status === "under_review").length} claims pending decision</p>
                </div>
              )}
            </div>
          )}

          <h3 className="text-lg font-semibold text-slate-900">Claims History</h3>
          {loading ? (
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
          ) : claims.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No claims filed yet. Purchase a policy and wait for weather triggers to file claims!
            </div>
          ) : (
            claims.map((claim) => <ClaimCard key={claim._id} claim={claim} />)
          )}
        </section>
        <aside className="space-y-4">
          <TriggerSimulator />
        </aside>
      </main>
    </div>
  );
};

export default ClaimsPage;
