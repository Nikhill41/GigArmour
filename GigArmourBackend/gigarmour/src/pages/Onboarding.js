import React, { useState } from 'react';

const RISK_PROFILES = {
  'Delhi NCR': { score: 67, label: 'Medium-High', color: '#EF9F27', textColor: '#854F0B', bars: [78, 90, 50, 20], recommended: 50 },
  'Mumbai': { score: 74, label: 'High', color: '#D85A30', textColor: '#993C1D', bars: [88, 60, 40, 30], recommended: 60 },
  'Bangalore': { score: 28, label: 'Low', color: '#1D9E75', textColor: '#0F6E56', bars: [20, 30, 15, 10], recommended: 20 },
  'Chennai': { score: 45, label: 'Medium', color: '#EF9F27', textColor: '#854F0B', bars: [55, 40, 35, 25], recommended: 35 },
  'Kolkata': { score: 52, label: 'Medium', color: '#EF9F27', textColor: '#854F0B', bars: [65, 45, 30, 40], recommended: 40 },
};

const RISK_LABELS = ['Flood History', 'AQI Frequency', 'Heat Events', 'Strike/Curfew Risk'];
const RISK_LEVELS = ['High', 'Very High', 'Medium', 'Low'];

export default function Onboarding() {
  const [city, setCity] = useState('Delhi NCR');
  const [submitted, setSubmitted] = useState(false);
  const profile = RISK_PROFILES[city];

  return (
    <>
      <div className="page-header">
        <div className="page-title">Worker Onboarding</div>
        <div className="page-sub">Optimized 3-step process · Under 3 minutes</div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Registration</div>

          <div style={{ marginBottom: 20 }}>
            {[
              { n: 1, title: 'Phone + Platform Link', desc: 'OTP verification + link your Zomato/Swiggy worker ID for activity baseline' },
              { n: 2, title: 'Location & Zone Setup', desc: 'GPS-confirm your home zone; AI assigns city risk tier automatically' },
              { n: 3, title: 'Choose Weekly Plan & Pay', desc: '₹20–₹70/week via UPI. Coverage starts next working day.' },
            ].map(s => (
              <div className="step-item" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Platform</label>
                <select className="form-input">
                  <option>Zomato</option><option>Swiggy</option><option>Zepto</option>
                  <option>Amazon</option><option>Blinkit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-input" value={city} onChange={e => setCity(e.target.value)}>
                  {Object.keys(RISK_PROFILES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setSubmitted(true)}>
                Register & Get My Quote
              </button>
            </>
          ) : (
            <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green-dark)', marginTop: 8 }}>Registration Successful!</div>
              <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
                Recommended plan: ₹{profile.recommended}/week · Starts tomorrow
              </div>
              <button className="btn btn-outline" style={{ marginTop: 12, fontSize: 12 }} onClick={() => setSubmitted(false)}>
                Register Another
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">AI Risk Profile · {city}</div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>AI Risk Score</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: profile.color }}>{profile.score} <span style={{ fontSize: 14, fontWeight: 400 }}>/ 100</span></div>
            <div style={{ fontSize: 12, color: profile.textColor, marginTop: 2 }}>{profile.label} Risk · {city}</div>
          </div>

          {RISK_LABELS.map((label, i) => (
            <div className="risk-row" key={label}>
              <div className="risk-top">
                <span>{label}</span>
                <span>{RISK_LEVELS[i]}</span>
              </div>
              <div className="risk-track">
                <div className="risk-fill" style={{
                  width: `${profile.bars[i]}%`,
                  background: profile.bars[i] > 60 ? 'var(--red)' : profile.bars[i] > 35 ? 'var(--amber)' : 'var(--green)'
                }}></div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Recommended plan: <strong style={{ color: 'var(--text)' }}>₹{profile.recommended}/week</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Max weekly payout: ₹{(profile.recommended * 40).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
