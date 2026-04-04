import Navbar from "../components/Navbar";
import ClaimCard from "../components/ClaimCard";
import TriggerSimulator from "../components/TriggerSimulator";

const ClaimsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <ClaimCard />
        </section>
        <aside className="space-y-4">
          <TriggerSimulator />
        </aside>
      </main>
    </div>
  );
};

export default ClaimsPage;
