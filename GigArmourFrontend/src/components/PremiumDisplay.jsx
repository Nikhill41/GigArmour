const PremiumDisplay = ({ amount, tier }) => {
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Weekly premium</p>
      <p className="mt-2 text-3xl font-semibold">Rs {amount}</p>
      <p className="text-sm text-slate-500">Tier: {tier}</p>
    </div>
  );
};

export default PremiumDisplay;
