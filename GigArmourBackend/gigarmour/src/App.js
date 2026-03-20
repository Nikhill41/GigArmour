import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import PremiumCalculator from './pages/PremiumCalculator';
import LiveTriggers from './pages/LiveTriggers';
import Claims from './pages/Claims';
import FraudDefense from './pages/FraudDefense';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'onboarding', label: 'Onboarding', icon: '◎' },
  { id: 'premium', label: 'Premium Calculator', icon: '◆' },
  { id: 'triggers', label: 'Live Triggers', icon: '⚡' },
  { id: 'claims', label: 'Claims', icon: '◉' },
  { id: 'fraud', label: 'Fraud Defense', icon: '🛡' },
];

const PAGES = { dashboard: Dashboard, onboarding: Onboarding, premium: PremiumCalculator, triggers: LiveTriggers, claims: Claims, fraud: FraudDefense };

export default function App() {
  const [active, setActive] = useState('dashboard');
  const PageComponent = PAGES[active];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>GigArmour</h1>
          <p>Parametric Income Insurance</p>
          <span className="sidebar-badge">Phase 1 Demo</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item${active === n.id ? ' active' : ''}`}
              onClick={() => setActive(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="worker-pill">
            <div className="name">Rahul Sharma</div>
            <div className="meta">Zomato · Delhi NCR</div>
            <div className="status-dot"><span className="dot"></span> Covered this week</div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}
