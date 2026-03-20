import React, { useState } from 'react';

const CITY_BASE = { 'Delhi NCR': 40, 'Mumbai': 50, 'Bangalore': 20, 'Chennai': 30, 'Kolkata': 35 };
const PLATFORM_ADD = { 'Zomato (Food)': 5, 'Swiggy (Food)': 5, 'Zepto / Blinkit (Q-Commerce)': 10, 'Amazon / Flipkart (E-Commerce)': 0 };
const HOURS_ADD = { 'Part-time (4–6 hrs)': 0, 'Full-time (8–10 hrs)': 5, 'Extended (12+ hrs)': 10 };
const ZONE_ADD = { 'Flood-prone zone': 10, 'High AQI zone': 7, 'Standard zone': 0 };

export default function PremiumCalculator() {
  const [city, setCity] = useState('Delhi NCR');
  const [platform, setPlatform] = useState('Zomato (Food)');
  const [hours, setHours] = useState('Full-time (8–10 hrs)');
  const [zone, setZone] = useState('Standard zone');

  const base = CITY_BASE[city] || 40;
  const total = Math.min(70, Math.max(20, base + PLATFORM_ADD[platform] + HOURS_ADD[hours] + ZONE_ADD[zone]));
  const maxPayout = total * 40;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Premium Calculator</div>
        <div className="page-sub">AI-powered dynamic weekly pricing</div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Calculate My Weekly Premium</div>

          <div className="form-group">
            <label className="form-label">City</label>
            <select className="form-input" value={city} onChange={e => setCity(e.target.value)}>
              {Object.keys(CITY_BASE).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Platform</label>
            <select className="form-input" value={platform} onChange={e => setPlatform(e.target.value)}>
              {Object.keys(PLATFORM_ADD).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Daily Active Hours</label>
            <select className="form-input" value={hours} onChange={e => setHours(e.target.value)}>
              {Object.keys(HOURS_ADD).map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Operating Zone</label>
            <select className="form-input" value={zone} onChange={e => setZone(e.target.value)}>
              {Object.keys(ZONE_ADD).map(z => <option key={z}>{z}</option>)}
            </select>
          </div>

          <div className="premium-box">
            <div className="premium-amount">₹{total}</div>
            <div className="premium-label">per week · all parametric triggers covered</div>
            <div className="premium-coverage">Max payout this week: ₹{maxPayout.toLocaleString()}</div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-title">Pricing Breakdown</div>
            {[
              { label: 'Base city risk', value: `+₹${CITY_BASE[city]}` },
              { label: 'Platform type', value: `+₹${PLATFORM_ADD[platform]}` },
              { label: 'Active hours', value: `+₹${HOURS_ADD[hours]}` },
              { label: 'Zone modifier', value: `+₹${ZONE_ADD[zone]}` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 500 }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 0 0', fontWeight: 600 }}>
              <span>Weekly Premium</span>
              <span style={{ color: 'var(--green)' }}>₹{total}</span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Standard Tiers</div>
            {[
              { label: 'Low Risk', cities: 'Bangalore, Mysore', price: '₹20/wk', featured: false },
              { label: 'Medium Risk', cities: 'Chennai, Kolkata', price: '₹40/wk', featured: total >= 35 && total <= 45 },
              { label: 'High Risk', cities: 'Delhi NCR, Mumbai', price: '₹70/wk', featured: false },
            ].map(t => (
              <div key={t.label} className={`tier-card${t.featured ? ' featured' : ''}`}>
                <div>
                  <div className="tier-name">{t.label}</div>
                  <div className="tier-city">{t.cities}</div>
                </div>
                <div className="tier-price" style={{ color: t.featured ? 'var(--green-dark)' : 'var(--text)' }}>{t.price}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              AI dynamically adjusts within each tier based on hyper-local zone history and predictive weather data.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
