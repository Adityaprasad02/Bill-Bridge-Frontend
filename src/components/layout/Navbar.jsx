import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Receipt } from "lucide-react";
import useAuthStore from "@/features/auth/authStore";
import { logoutUser } from "@/features/auth/authService";


export default function Navbar() {
  const [open, setOpen] = useState(false);
const accessToken = useAuthStore((s) => s.accessToken);
const clearSession = useAuthStore((s) => s.clearSession);
console.log("Access token in Navbar:", accessToken);
const handleLogout = async () => {
  try {
    await logoutUser();
  } catch (err) {
    console.error("Logout failed", err);
  }
  clearSession();
};

const isLoggedIn = !!accessToken;


  const logoutBtnClass =
    "px-4 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-200";
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-zinc-800 text-white"
        : "text-zinc-300 hover:text-white hover:bg-zinc-800"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
       <NavLink to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
            <Receipt className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">
            Bill<span className="text-blue-500">Bridge</span>
        </span>
        </NavLink>


        {/* Desktop Links */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={linkClass}>
                Signup
              </NavLink>
            </>
          ) : (
            <>
              <button type="button" onClick={handleLogout} className={logoutBtnClass}>
                Logout
              </button>
              {/* TODO: Implement logout functionality later */}
            </>
          )}
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white md:hidden"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>

            {!isLoggedIn ? (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={linkClass}>
                  Signup
                </NavLink>
              </>
            ) : (
              <>
                <button
                type="button"
                onClick={handleLogout}
                className={logoutBtnClass}
              >
                Logout
              </button>
                {/* TODO: Implement logout functionality later */}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}