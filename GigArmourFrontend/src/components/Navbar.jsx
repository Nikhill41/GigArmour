import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold">
          GigArmour
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/policy">Policy</NavLink>
              <NavLink to="/claims">Claims</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-300 px-4 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
