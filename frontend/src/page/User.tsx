import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaCalendarCheck,
} from "react-icons/fa";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
}

export default function User() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("cambo_token");
    const cachedUser = localStorage.getItem("cambo_user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        window.setTimeout(() => setUser(parsedUser), 0);
      } catch {
        window.setTimeout(() => setUser(null), 0);
      }
    }

    // Fetch live verified profile from backend database
    fetch("http://localhost:5059/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          setUser(data.user);
          localStorage.setItem("cambo_user", JSON.stringify(data.user));
        } else {
          // Token invalid
          localStorage.removeItem("cambo_token");
          localStorage.removeItem("cambo_user");
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("cambo_token");
    localStorage.removeItem("cambo_user");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#1e1e24] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-red-600 to-red-950 text-4xl font-bold shadow-lg border-2 border-red-500/40">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {user.name}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  user.role === "admin"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {user.role} Account
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-red-500 hover:text-red-400 hover:bg-zinc-800"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="rounded-2xl border border-zinc-800 bg-[#1e1e24] p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaUser className="h-4 w-4 text-red-500" />
            Personal Details
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-2">
                <FaUser className="h-3.5 w-3.5 text-zinc-500" /> Full Name:
              </span>
              <span className="font-medium text-zinc-100">{user.name}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-2">
                <FaEnvelope className="h-3.5 w-3.5 text-zinc-500" /> Email
                Address:
              </span>
              <span className="font-medium text-zinc-100">{user.email}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-2">
                <FaPhone className="h-3.5 w-3.5 text-zinc-500" /> Phone:
              </span>
              <span className="font-medium text-zinc-100">
                {user.phone || "Not set"}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-zinc-400 flex items-center gap-2">
                <FaShieldAlt className="h-3.5 w-3.5 text-zinc-500" /> Access
                Role:
              </span>
              <span className="font-medium capitalize text-amber-400">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions / Shortcuts */}
        <div className="rounded-2xl border border-zinc-800 bg-[#1e1e24] p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaTicketAlt className="h-4 w-4 text-red-500" />
              Account Shortcuts
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              View your booked movie tickets, manage schedules, or browse
              currently showing movies.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/tickets"
              className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm font-medium text-white transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <FaCalendarCheck className="h-4 w-4 text-red-500" />
                <span>My Booked Tickets</span>
              </div>
              <span className="text-xs text-zinc-400">➔</span>
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin/schedules"
                className="flex items-center justify-between rounded-xl bg-amber-600/10 border border-amber-500/30 px-4 py-3 text-sm font-medium text-amber-400 transition hover:bg-amber-600/20"
              >
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="h-4 w-4 text-amber-400" />
                  <span>Go to Admin Dashboard</span>
                </div>
                <span className="text-xs text-amber-400">➔</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
