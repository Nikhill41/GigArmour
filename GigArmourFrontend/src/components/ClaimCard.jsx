const statusBadge = {
  approved: "bg-emerald-100 text-emerald-700",
  provisional: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  rejected: "bg-rose-100 text-rose-700",
  under_review: "bg-orange-100 text-orange-700"
};

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

const ClaimCard = ({ claim }) => {
  const status = claim?.status || "pending";
  const triggerLabel = triggerLabels[claim?.triggerType] || claim?.triggerType || "Trigger";
  
  // Calculate actual payout based on status
  let actualPayout = 0;
  if (status === "approved") {
    actualPayout = claim?.payoutAmount || 0;
  } else if (status === "provisional") {
    actualPayout = Math.floor((claim?.payoutAmount || 0) * 0.7);
  } else {
    actualPayout = 0;
  }
  
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Claim #{claim?._id?.slice(-6) || "--"}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusBadge[status] || statusBadge.pending
          }`}
        >
          {status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        {triggerLabel} · {formatDate(claim?.createdAt)}
      </p>
      
      {/* Payout Information */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-600 font-medium">Trigger Value</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {claim?.triggerValue?.toFixed(2) || "--"}
          </p>
          <p className="text-xs text-slate-500">vs {claim?.threshold || "--"} threshold</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-600 font-medium">
            {status === "approved" ? "Approved Payout" : status === "provisional" ? "Provisional Payout (70%)" : "Base Payout"}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            ₹{actualPayout}
          </p>
          {status === "provisional" && (
            <p className="text-xs text-slate-500">Full: ₹{claim?.payoutAmount || 0}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;
