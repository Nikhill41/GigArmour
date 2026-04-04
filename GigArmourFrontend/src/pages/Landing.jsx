import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import PremiumDisplay from "../components/PremiumDisplay";
import RiskBadge from "../components/RiskBadge";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              GigArmour
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Parametric income insurance built for gig workers.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Automatic weekly coverage triggered by real-time weather and air
              quality data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Get insured
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <RiskBadge tier="medium" score={58} />
            <PremiumDisplay amount={40} tier="medium" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
