import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    pincode: "",
    platform: "Zomato",
    averageDailyDeliveries: 0,
    workHoursPerDay: 0,
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "averageDailyDeliveries" || name === "workHoursPerDay" ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success("Registration complete");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Unable to register");
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
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>
          <select
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
          >
            <option value="Zomato">Zomato</option>
            <option value="Swiggy">Swiggy</option>
            <option value="Amazon">Amazon</option>
            <option value="Zepto">Zepto</option>
            <option value="Blinkit">Blinkit</option>
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              name="averageDailyDeliveries"
              type="number"
              min="0"
              placeholder="Avg daily deliveries"
              value={formData.averageDailyDeliveries}
              onChange={handleChange}
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3"
              name="workHoursPerDay"
              type="number"
              min="0"
              placeholder="Hours per day"
              value={formData.workHoursPerDay}
              onChange={handleChange}
            />
          </div>
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
