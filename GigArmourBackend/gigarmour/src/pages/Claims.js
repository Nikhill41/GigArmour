import React, { useState } from 'react';

const ALL_CLAIMS = [
  { init: 'RS', name: 'Rahul Sharma', city: 'Delhi', event: 'Heavy Rain', risk: 18, amount: 500, status: 'Instant Paid', badge: 'badge-green' },
  { init: 'PK', name: 'Priya Kumari', city: 'Delhi', event: 'AQI Spike', risk: 12, amount: 500, status: 'Instant Paid', badge: 'badge-green' },
  { init: 'AM', name: 'Amir Mohammed', city: 'Mumbai', event: 'Heavy Rain', risk: 54, amount: 350, status: '70% Provisional', badge: 'badge-amber' },
  { init: 'VR', name: 'Vijay Reddy', city: 'Chennai', event: 'Low Visibility', risk: 8, amount: 300, status: 'Instant Paid', badge: 'badge-green' },
  { init: 'SK', name: 'Sanjay Kumar', city: 'Delhi', event: 'Suspicious GPS', risk: 78, amount: 0, status: 'Fraud Hold', badge: 'badge-red' },
  { init: 'NT', name: 'Neha Thakur', city: 'Delhi', event: 'Heavy Rain', risk: 22, amount: 500, status: 'Instant Paid', badge: 'badge-green' },
  { init: 'MK', name: 'Manoj Kumar', city: 'Mumbai', event: 'Heavy Rain', risk: 41, amount: 350, status: '70% Provisional', badge: 'badge-amber' },
  { init: 'RP', name: 'Ravi Patel', city: 'Bangalore', event: 'Extreme Heat', risk: 5, amount: 400, status: 'Instant Paid', badge: 'badge-green' },
];

const FILTER_OPTIONS = ['All', 'Instant Paid', '70% Provisional', 'Fraud Hold'];

export default function Claims() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? ALL_CLAIMS : ALL_CLAIMS.filter(c => c.status === filter);
  const total = ALL_CLAIMS.filter(c => c.status === 'Instant Paid').reduce((s, c) => s + c.amount, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Claims Management</div>
        <div className="page-sub">Zero-touch automated processing</div>
      </div>

      <div className="metrics-row">
        {[
          { label: 'Auto-Approved', value: '141', change: '98.6% approval rate', cls: 'change-up' },
          { label: 'Under Review', value: '2', change: 'Within 48hr SLA', cls: 'change-neutral' },
          { label: 'Avg Processing Time', value: '1.2s', change: 'Fully automated', cls: 'change-up' },
          { label: 'Total Disbursed', value: '₹71.5K', change: 'This week', cls: 'change-up' },
        ].map(m => (
          <div className="metric-card" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-change ${m.cls}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className="card one-col">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Claims · Sat Mar 20</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.map(c => (
          <div className="row-item" key={c.name}>
            <div className="avatar">{c.init}</div>
            <div style={{ flex: 1 }}>
              <div className="row-name">{c.name}</div>
              <div className="row-meta">{c.event} · Risk score {c.risk} · {c.city}</div>
            </div>
            <div className="row-right">
              <span className="row-amount">₹{c.amount}</span>
              <span className={`badge ${c.badge}`}>{c.status}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            No claims with this status.
          </div>
        )}
      </div>

      <div className="card one-col">
        <div className="card-title">Claim Processing Pipeline</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Threshold Breached', color: 'var(--green-light)', text: 'var(--green-dark)' },
            { label: '→', color: 'transparent', text: 'var(--text-muted)' },
            { label: 'Zone Match', color: 'var(--green-light)', text: 'var(--green-dark)' },
            { label: '→', color: 'transparent', text: 'var(--text-muted)' },
            { label: 'Fraud Scan', color: '#FAEEDA', text: '#854F0B' },
            { label: '→', color: 'transparent', text: 'var(--text-muted)' },
            { label: 'UPI Payout', color: 'var(--green-light)', text: 'var(--green-dark)' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: s.label === '→' ? 0 : 1,
              background: s.color, color: s.text,
              borderRadius: 8, padding: s.label === '→' ? '8px 0' : '10px 8px',
              fontSize: s.label === '→' ? 16 : 12, fontWeight: 500,
              textAlign: 'center',
            }}>{s.label}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Entire pipeline completes in under 2 seconds. No manual intervention required for standard claims.
        </div>
      </div>
    </>
  );
}
