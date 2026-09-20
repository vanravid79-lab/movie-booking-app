import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Ticket,
  Users,
  Film,
  DollarSign,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  todayRevenue: number;
  ticketsSold: number;
  activeMovies: number;
  totalCustomers: number;
  recentBookings: {
    id: string;
    customer: string;
    email: string;
    movie: string;
    cinema: string;
    hall: string;
    seats: string[];
    amount: number;
    status: string;
    date: string;
  }[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-[#18181f] border border-zinc-800/80 rounded-xl p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Icon size={18} className="text-rose-400" strokeWidth={2.2} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
          <TrendingUp size={12} />
          Live
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-white tracking-tight">{value}</p>
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-500">{subtitle}</span>
      </div>
    </div>
  );
}

function DashboardHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("cambo_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const adminName = user?.name || "Administrator";

  useEffect(() => {
    fetch(`${API_URL}/admin/dashboard-stats`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-500/20 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Sparkles size={14} />
            Box Office Operations
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Welcome back, {adminName}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time box office monitoring, ticket reservations, and theatre stats.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/schedules")}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-600/20"
          >
            Manage Showtimes
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/bookings")}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
          >
            All Bookings
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={`$${(data?.todayRevenue || 0).toFixed(2)}`}
          subtitle="All locations"
          icon={DollarSign}
        />
        <StatCard
          label="Total Revenue"
          value={`$${(data?.totalRevenue || 0).toFixed(2)}`}
          subtitle="Lifetime sales"
          icon={TrendingUp}
        />
        <StatCard
          label="Tickets Sold"
          value={`${data?.ticketsSold || 0}`}
          subtitle="Reserved seats"
          icon={Ticket}
        />
        <StatCard
          label="Active Movies"
          value={`${data?.activeMovies || 0}`}
          subtitle="Showing now"
          icon={Film}
        />
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-[#18181f] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Customer Bookings</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Latest ticket sales and reservations</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/bookings")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            View all bookings
            <ArrowUpRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading box office data...</div>
        ) : !data?.recentBookings.length ? (
          <div className="p-8 text-center text-sm text-zinc-500">No bookings placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/40 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-3">Booking ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Movie</th>
                  <th className="px-6 py-3">Cinema / Hall</th>
                  <th className="px-6 py-3 text-center">Seats</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-rose-400">
                      {b.id}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-white">{b.customer}</p>
                      <p className="text-xs text-zinc-500">{b.email}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-zinc-200">{b.movie}</td>
                    <td className="px-6 py-3.5 text-xs text-zinc-400">
                      <p className="text-zinc-300">{b.cinema}</p>
                      <p className="text-zinc-500">{b.hall}</p>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex flex-wrap justify-center gap-1 max-w-xs mx-auto">
                        {b.seats.map((seat) => (
                          <span
                            key={seat}
                            className="inline-block rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-400">
                      ${b.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs text-zinc-500">
                      {formatTimeAgo(b.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;
