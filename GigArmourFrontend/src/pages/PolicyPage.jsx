import Navbar from "../components/Navbar";

const PolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Your policy</h2>
          <p className="mt-3 text-slate-600">Review your weekly coverage and premium details.</p>
        </div>
      </main>
    </div>
  );
};

export default PolicyPage;
