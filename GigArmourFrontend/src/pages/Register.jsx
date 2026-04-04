import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setOtpCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Enter your email first");
      return;
    }

    setOtpLoading(true);
    try {
      await requestOtp(formData.email);
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setOtpCooldown(30);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register({
        ...formData,
        otp
      });
      toast.success("Registration complete");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">Create your rider profile</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="phone"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              name="otp"
              placeholder="Email OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700"
              onClick={handleSendOtp}
              disabled={otpLoading || otpCooldown > 0}
            >
              {otpLoading
                ? "Sending..."
                : otpCooldown > 0
                  ? `Resend in ${otpCooldown}s`
                  : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
            </button>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-slate-900" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
