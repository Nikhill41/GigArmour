import React from 'react';

const BARS = [
  { day: 'Mon', h: 28, color: '#9FE1CB' },
  { day: 'Tue', h: 42, color: '#9FE1CB' },
  { day: 'Wed', h: 78, color: '#1D9E75' },
  { day: 'Thu', h: 55, color: '#9FE1CB' },
  { day: 'Fri', h: 32, color: '#9FE1CB' },
  { day: 'Sat', h: 92, color: '#EF9F27' },
  { day: 'Sun', h: 18, color: '#9FE1CB' },
];

const CLAIMS = [
  { init: 'RS', name: 'Rahul Sharma', meta: 'Heavy Rain · Delhi · Sat 14:23', amount: '₹500', badge: 'Instant Paid', cls: 'badge-green' },
  { init: 'PK', name: 'Priya Kumari', meta: 'AQI Spike · Delhi · Sat 15:01', amount: '₹500', badge: 'Instant Paid', cls: 'badge-green' },
  { init: 'AM', name: 'Amir Mohammed', meta: 'Heavy Rain · Mumbai · Sat 16:45', amount: '₹350', badge: '70% Provisional', cls: 'badge-amber' },
  { init: 'VR', name: 'Vijay Reddy', meta: 'Low Visibility · Chennai · Fri 08:10', amount: '₹300', badge: 'Instant Paid', cls: 'badge-green' },
  { init: 'SK', name: 'Sanjay Kumar', meta: 'Suspicious GPS · Risk 78 · Delhi', amount: '₹0', badge: 'Fraud Hold', cls: 'badge-red' },
];

const CITIES = [
  { name: 'Delhi NCR', count: 1204, pct: 84, cls: 'fill-amber' },
  { name: 'Mumbai', count: 891, pct: 62, cls: 'fill-red' },
  { name: 'Bangalore', count: 442, pct: 31, cls: 'fill-green' },
  { name: 'Chennai', count: 310, pct: 22, cls: 'fill-green' },
];

export default function Dashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Real-time overview · Week of Mar 17–23, 2026</div>
      </div>

      <div className="metrics-row">
        {[
          { label: 'Active Policies', value: '2,847', change: '+12% this week', cls: 'change-up' },
          { label: 'Claims Triggered', value: '143', change: 'Auto-processed', cls: 'change-up' },
          { label: 'Payouts Released', value: '₹71,500', change: 'Avg ₹500/claim', cls: 'change-up' },
          { label: 'Fraud Flagged', value: '7', change: '0.3% fraud rate', cls: 'change-down' },
        ].map(m => (
          <div className="metric-card" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-change ${m.cls}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Weekly Claims Volume</div>
          <div className="bar-chart">
            {BARS.map(b => (
              <div className="bar-col" key={b.day}>
                <div className="bar-fill" style={{ height: `${b.h}%`, background: b.color }}></div>
                <div className="bar-label">{b.day}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Sat spike: heavy rain event (118mm/3hr) across Delhi NCR
          </div>
        </div>

        <div className="card">
          <div className="card-title">Coverage by City</div>
          {CITIES.map(c => (
            <div className="risk-row" key={c.name}>
              <div className="risk-top"><span>{c.name}</span><span>{c.count.toLocaleString()}</span></div>
              <div className="risk-track"><div className={`risk-fill ${c.cls}`} style={{ width: `${c.pct}%` }}></div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card one-col">
        <div className="card-title">Recent Automated Payouts</div>
        {CLAIMS.map(c => (
          <div className="row-item" key={c.name}>
            <div className="avatar">{c.init}</div>
            <div>
              <div className="row-name">{c.name}</div>
              <div className="row-meta">{c.meta}</div>
            </div>
            <div className="row-right">
              <span className="row-amount">{c.amount}</span>
              <span className={`badge ${c.cls}`}>{c.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
