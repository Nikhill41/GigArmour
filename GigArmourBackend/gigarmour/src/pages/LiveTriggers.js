import React, { useState, useEffect } from 'react';

const TRIGGERS = [
  { name: 'Heavy Rain', param: 'precipitationIntensity', threshold: '>100mm/3hr', current: '112mm/3hr', payout: '₹500', status: 'TRIGGERED', over: true },
  { name: 'AQI Spike', param: 'AQI Index', threshold: '>400 AQI', current: '387 AQI', payout: '₹500', status: 'WATCHING', over: false },
  { name: 'Extreme Heat', param: 'temperature', threshold: '>45°C', current: '38°C', payout: '₹400', status: 'CLEAR', over: false },
  { name: 'Flood Risk', param: 'precipitationAccumulation', threshold: '>200mm/day', current: '145mm/day', payout: '₹1,000', status: 'CLEAR', over: false },
  { name: 'Low Visibility', param: 'visibility', threshold: '<200m', current: '650m', payout: '₹300', status: 'CLEAR', over: false },
];

const STATUS_STYLE = {
  TRIGGERED: { background: '#FAECE7', color: '#993C1D' },
  WATCHING: { background: '#FAEEDA', color: '#854F0B' },
  CLEAR: { background: '#EAF3DE', color: '#3B6D11' },
};

const SIM_EVENTS = [
  {
    type: 'Heavy Rain (118mm/3hr)',
    steps: [
      { title: 'Weather threshold breached', meta: 'Tomorrow.io API detected 118mm/3hr · 14:23:05', done: true },
      { title: 'Trigger engine activated', meta: '143 active policies in affected zone identified · 14:23:06', done: true },
      { title: 'Fraud layer scan complete', meta: '141 approved · 2 held for review · 14:23:07', done: true },
      { title: 'UPI payouts dispatched', meta: '₹70,500 sent · avg 1.2s per payout · 14:23:09', done: false },
    ],
  },
  {
    type: 'AQI Spike (AQI 420)',
    steps: [
      { title: 'AQI threshold breached', meta: 'OpenWeatherMap API: AQI hit 420 · 09:15:00', done: true },
      { title: '89 policies in affected zone triggered', meta: 'Delhi NCR zone 4, 5, 6 · 09:15:01', done: true },
      { title: 'Fraud scan passed', meta: 'All 89 claims cleared instantly · 09:15:02', done: true },
      { title: '₹44,500 disbursed via UPI', meta: 'Avg processing time: 0.9s · 09:15:03', done: false },
    ],
  },
  {
    type: 'Flood Risk (210mm/day)',
    steps: [
      { title: 'Flood threshold breached', meta: '210mm/day detected · IMD + Tomorrow.io cross-verified · 11:00:00', done: true },
      { title: '62 policies triggered', meta: 'High-risk flood zone workers · 11:00:01', done: true },
      { title: 'Enhanced fraud check triggered', meta: 'High payout (₹1,000) activates extra verification · 11:00:04', done: true },
      { title: '₹62,000 disbursed', meta: '60 instant + 2 provisional · 11:00:07', done: false },
    ],
  },
];

export default function LiveTriggers() {
  const [simType, setSimType] = useState(0);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const event = SIM_EVENTS[simType];

  function runSim() {
    setRunning(true);
    setStep(0);
  }

  useEffect(() => {
    if (!running || step < 0) return;
    if (step >= event.steps.length) { setRunning(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [running, step, event.steps.length]);

  function reset() { setStep(-1); setRunning(false); }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Live Parametric Triggers</div>
        <div className="page-sub">Real-time monitoring · Delhi NCR · Mar 20, 2026</div>
      </div>

      <div className="alert-banner">
        ⚠ Heavy Rain alert active — 112mm/3hr detected. 143 claims auto-triggered.
      </div>

      <div className="card one-col">
        <div className="card-title">Trigger Status</div>
        {TRIGGERS.map(t => (
          <div className="trigger-row" key={t.name}>
            <div>
              <div className="trigger-name">{t.name}</div>
              <div className="trigger-threshold">Threshold: {t.threshold} · Current: <strong style={{ color: t.over ? '#D85A30' : 'inherit' }}>{t.current}</strong></div>
            </div>
            <div className="trigger-right">
              <span className="badge" style={STATUS_STYLE[t.status]}>{t.status}</span>
              <div className="trigger-payout">{t.payout} payout</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card one-col">
        <div className="card-title">Simulate a Disruption Event</div>
        <div className="form-group">
          <label className="form-label">Event Type</label>
          <select className="form-input" value={simType} onChange={e => { setSimType(Number(e.target.value)); reset(); }}>
            {SIM_EVENTS.map((e, i) => <option key={i} value={i}>{e.type}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={runSim} disabled={running}>
            {running ? 'Running...' : '▶ Simulate Trigger'}
          </button>
          {step >= 0 && <button className="btn btn-outline" onClick={reset}>Reset</button>}
        </div>

        {step >= 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="timeline">
              {event.steps.map((s, i) => (
                <div className="tl-item" key={i} style={{ opacity: i < step ? 1 : 0.35, transition: 'opacity 0.4s' }}>
                  <div className={`tl-dot${i === step - 1 && step < event.steps.length ? ' pending' : ''}`}></div>
                  <div className="tl-title">{s.title}</div>
                  <div className="tl-meta">{s.meta}</div>
                </div>
              ))}
            </div>
            {step >= event.steps.length && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--green-light)', borderRadius: 8, fontSize: 13, color: 'var(--green-dark)', fontWeight: 500 }}>
                ✓ Simulation complete — all claims processed automatically.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
