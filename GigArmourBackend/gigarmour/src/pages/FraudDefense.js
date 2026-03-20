import React, { useState } from 'react';

const LAYERS = [
  {
    title: 'Layer 1 · GPS Integrity',
    checks: [
      { pass: false, text: 'No movement trail leading to zone' },
      { pass: false, text: 'GPS signal unnaturally perfect (spoofed)' },
      { pass: false, text: 'Speed: 0→8km in 2min (impossible)' },
      { pass: true, text: 'Cell tower mismatch detected' },
    ],
  },
  {
    title: 'Layer 2 · Behavioral Baseline',
    checks: [
      { pass: false, text: 'Never delivered in claimed zone' },
      { pass: false, text: 'No platform activity in 30 days' },
      { pass: false, text: 'Device sensors: completely static' },
      { pass: false, text: '0 deliveries before filing claim' },
    ],
  },
  {
    title: 'Layer 3 · Network Graph',
    checks: [
      { pass: false, text: '500 claims filed in 90 seconds' },
      { pass: false, text: 'Same IP range registrations' },
      { pass: false, text: 'UPI accounts: same branch cluster' },
      { pass: false, text: 'Shared device fingerprints found' },
    ],
  },
  {
    title: 'Layer 4 · Cross-Validation',
    checks: [
      { pass: false, text: 'Not online on Zomato/Swiggy API' },
      { pass: true, text: 'Weather event is genuinely real' },
      { pass: false, text: 'No traffic data at claimed location' },
      { pass: false, text: 'No public geo-signals from zone' },
    ],
  },
];

const TIERS = [
  { label: 'Score 0–30', action: 'Instant Payout', count: '2,614 workers', bg: 'var(--green-light)', text: 'var(--green-dark)', bar: 91 },
  { label: 'Score 31–60', action: '70% Provisional', count: '189 workers', bg: '#FAEEDA', text: '#633806', bar: 6.6 },
  { label: 'Score 61–100', action: 'Hold + Manual Review', count: '44 workers', bg: '#FAECE7', text: '#993C1D', bar: 1.5 },
];

export default function FraudDefense() {
  const [simRun, setSimRun] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Fraud Defense</div>
        <div className="page-sub">Market Crash Anti-Spoofing Architecture · Phase 1</div>
      </div>

      <div className="alert-banner">
        🚨 Market Crash Scenario: 500 coordinated fake GPS workers detected. All 4 defense layers activated.
      </div>

      <div className="card one-col">
        <div className="card-title">4-Layer Defense · Attack Result</div>
        <div className="fraud-grid">
          {LAYERS.map(l => (
            <div className="fraud-layer" key={l.title}>
              <div className="fraud-layer-title">{l.title}</div>
              {l.checks.map((c, i) => (
                <div className="fraud-check" key={i}>
                  <span className={c.pass ? 'check-pass' : 'check-fail'}>{c.pass ? '✓' : '✗'}</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: 12, background: '#FAECE7', borderRadius: 8, fontSize: 13, color: '#993C1D' }}>
          <strong>Result:</strong> Fraud ring blocked. 3+ simultaneous layer failures = automatic escalation to review queue.
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Risk-Tiered Payout Decision</div>
          {TIERS.map(t => (
            <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: t.bg, borderRadius: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{t.label} · <strong>{t.action}</strong></div>
                <div style={{ fontSize: 11, color: t.text, marginTop: 2, opacity: 0.8 }}>{t.count}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{t.bar.toFixed(1)}%</div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
            No legitimate worker waits more than 48 hours. Appeal via photo/video with timestamp metadata.
          </div>
        </div>

        <div className="card">
          <div className="card-title">Attack Summary</div>
          <div className="risk-row">
            <div className="risk-top"><span>Fraud Attempts Blocked</span><span>500 / 500</span></div>
            <div className="risk-track"><div className="risk-fill fill-red" style={{ width: '100%' }}></div></div>
          </div>
          <div className="risk-row">
            <div className="risk-top"><span>Legitimate Claims Paid</span><span>2,614</span></div>
            <div className="risk-track"><div className="risk-fill fill-green" style={{ width: '91%' }}></div></div>
          </div>
          <div className="risk-row">
            <div className="risk-top"><span>False Positives (held)</span><span>44</span></div>
            <div className="risk-track"><div className="risk-fill fill-amber" style={{ width: '1.5%' }}></div></div>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Post-Attack Actions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              1. Flagged accounts suspended for KYC re-verification<br />
              2. Fraud patterns fed back to ML model<br />
              3. Liquidity pool fully protected<br />
              4. Transparency report generated for admin
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {!simRun ? (
              <button className="btn btn-primary btn-full" onClick={() => setSimRun(true)}>
                Run Defense Simulation
              </button>
            ) : (
              <div style={{ background: 'var(--green-light)', borderRadius: 8, padding: 12, fontSize: 13, color: 'var(--green-dark)', textAlign: 'center' }}>
                ✓ All 500 fraud accounts blocked in 0.4s<br />
                <span style={{ fontSize: 11, opacity: 0.8 }}>2,614 genuine workers paid instantly</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card one-col">
        <div className="card-title">What Makes a Genuine Worker Different from a Fraudster</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Signal</th>
                <th style={{ textAlign: 'center', padding: '8px 0', color: 'var(--green-dark)', fontWeight: 500 }}>Genuine Worker</th>
                <th style={{ textAlign: 'center', padding: '8px 0', color: '#993C1D', fontWeight: 500 }}>Fraud Ring Member</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['GPS trail to zone', '✓ Gradual movement', '✗ Instant teleport'],
                ['Zone delivery history', '✓ Works here regularly', '✗ First appearance ever'],
                ['Platform app activity', '✓ Active last 24hrs', '✗ Absent / never used'],
                ['Claim timing', '✓ Gradual rise', '✗ Synchronized spike (90s)'],
                ['Device fingerprint', '✓ Single worker', '✗ Multiple IDs, same device'],
                ['UPI account pattern', '✓ Established account', '✗ Bulk-registered, same branch'],
              ].map(([sig, gen, fraud]) => (
                <tr key={sig} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 0', color: 'var(--text-muted)' }}>{sig}</td>
                  <td style={{ padding: '9px 0', textAlign: 'center', color: 'var(--green)' }}>{gen}</td>
                  <td style={{ padding: '9px 0', textAlign: 'center', color: 'var(--red)' }}>{fraud}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
