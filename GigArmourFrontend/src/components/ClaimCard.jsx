const ClaimCard = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Claim #GA-1281</h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Pending
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">Trigger: heavy_rain | Payout: Rs 500</p>
    </div>
  );
};

export default ClaimCard;
