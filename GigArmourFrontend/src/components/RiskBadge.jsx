const tierStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700"
};

const RiskBadge = ({ tier, score }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500">Risk tier</p>
        <p className="mt-2 text-2xl font-semibold capitalize text-slate-900">{tier}</p>
        <p className="text-sm text-slate-500">Score: {score}</p>
      </div>
      <span className={`rounded-full px-4 py-2 text-xs font-semibold ${tierStyles[tier]}`}>
        {tier} risk
      </span>
    </div>
  );
};

export default RiskBadge;
