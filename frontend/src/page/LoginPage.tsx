import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaLock, FaEnvelope } from "react-icons/fa";

export default function LoginPage() {
  const [role, setRole] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleFillDemo = (targetRole: "user" | "admin") => {
    setRole(targetRole);
    if (targetRole === "admin") {
      setEmail("admin@cinema.com");
      setPassword("admin123");
    } else {
      setEmail("user@cinema.com");
      setPassword("user123");
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5059/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to log in.");
      }

      // Store in localStorage
      localStorage.setItem("cambo_token", data.token);
      localStorage.setItem("cambo_user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/schedules");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e24] shadow-2xl backdrop-blur-sm">
        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-900/60 p-1.5">
          <button
            type="button"
            onClick={() => {
              setRole("user");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              role === "user"
                ? "bg-red-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FaUser className="h-4 w-4" />
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              role === "admin"
                ? "bg-amber-600 text-white shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FaUserShield className="h-4 w-4" />
            Admin Login
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {role === "admin" ? "Admin Management Portal" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {role === "admin"
                ? "Sign in with administrator credentials"
                : "Sign in to book tickets and manage reservations"}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative mt-1.5 flex items-center">
                <FaEnvelope className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@cinema.com" : "user@cinema.com"}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="relative mt-1.5 flex items-center">
                <FaLock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all shadow-md ${
                role === "admin"
                  ? "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
                  : "bg-red-600 hover:bg-red-500 active:scale-[0.99]"
              } disabled:opacity-50`}
            >
              {loading ? "Signing In..." : `Sign In as ${role === "admin" ? "Admin" : "User"}`}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 border-t border-zinc-800 pt-5 text-center">
            <p className="text-xs text-zinc-400 mb-2">Quick test filling:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("user")}
                className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Auto-fill User (user123)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Auto-fill Admin (admin123)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
