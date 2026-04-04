const WeatherCard = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Realtime</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">Weather snapshot</h3>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Rain intensity</span>
          <strong>Moderate</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Visibility</span>
          <strong>2.4 km</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>AQI</span>
          <strong>210</strong>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
