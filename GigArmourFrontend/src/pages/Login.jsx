import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(credentials.phone, credentials.password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="phone"
            placeholder="Phone"
            value={credentials.phone}
            onChange={handleChange}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="password"
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
