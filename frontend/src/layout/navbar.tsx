import { Navbar, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { IoSearchSharp } from "react-icons/io5";
import { LuTicket } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

export function NavbarCom() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const syncUser = () => {
    const userStr = localStorage.getItem("cambo_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUser();

    // Listen to storage and custom auth state changes
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("cambo_token");
    localStorage.removeItem("cambo_user");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <Navbar
      fluid
      rounded={false}
      className="sticky top-0 z-50 w-full shrink-0 !bg-[#27272a] px-6 py-4"
    >
      <div className="flex w-full items-center justify-between gap-6">
        {/* Left: Search input */}
        <div className="hidden items-center justify-between gap-2 rounded-full border border-gray-600 bg-transparent py-2 pl-5 pr-2 md:flex md:w-64">
          <input
            type="text"
            placeholder="Search Movies...."
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-300">
            <IoSearchSharp className="h-4 w-4" />
          </span>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="mx-auto flex items-center md:mx-0">
          <span className="text-xl font-extrabold uppercase tracking-widest text-white">
            Cambo Movie
          </span>
        </Link>

        {/* Right: Ticket, User Profile / Admin / Login, Notification */}
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="hidden items-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white transition hover:border-white md:flex"
          >
            <LuTicket className="h-4 w-4" />
            <span>Ticket</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === "admin" && (
                <Link
                  to="/admin/schedules"
                  className="rounded-full bg-amber-600/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-600/30 transition"
                >
                  Admin Panel
                </Link>
              )}

              {/* Profile Link Button */}
              <Link
                to="/user"
                title="View Personal Profile"
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-red-800 to-red-950 px-3.5 py-1.5 text-xs font-semibold text-gray-100 transition hover:from-red-700 hover:to-red-900 border border-red-500/30"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white uppercase">
                  {currentUser.name ? currentUser.name.charAt(0) : "U"}
                </div>
                <span>{currentUser.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:border-zinc-500 transition"
              >
                <FiLogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
            >
              <FaRegUser className="h-3 w-3" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/notification"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition hover:border-white"
          >
            <IoNotificationsOutline className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <NavbarToggle className="text-gray-300 md:hidden" />
      </div>

      {/* Mobile collapse */}
      <NavbarCollapse className="md:hidden">
        <div className="mt-2 flex items-center justify-between gap-2 rounded-full border border-gray-600 px-5 py-2">
          <input
            type="text"
            placeholder="Search Movies...."
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-400 outline-none"
          />
          <IoSearchSharp className="h-4 w-4 shrink-0 text-gray-300" />
        </div>

        <Link
          to="/tickets"
          className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-white"
        >
          <LuTicket className="h-4 w-4" />
          <span>Ticket</span>
        </Link>

        {currentUser ? (
          <>
            <Link
              to="/user"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-zinc-800 border border-zinc-700 px-5 py-2 text-sm font-medium text-white"
            >
              <FaRegUser className="h-4 w-4 text-red-500" />
              <span>Profile: {currentUser.name}</span>
            </Link>

            {currentUser.role === "admin" && (
              <Link
                to="/admin/schedules"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-amber-600/20 border border-amber-500/40 px-5 py-2 text-sm font-medium text-amber-300"
              >
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-red-500 px-5 py-2 text-sm font-medium text-red-400"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white"
          >
            <FaRegUser className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        )}
      </NavbarCollapse>
    </Navbar>
  );
}
