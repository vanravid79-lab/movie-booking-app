import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Ticket,
  Users,
  Film,
  DollarSign,
  ArrowUpRight,
  Clock,
} from "lucide-react";

interface StatCardData {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

const STATS: StatCardData[] = [
  {
    label: "Today's Revenue",
    value: "$4,286",
    delta: "+12.4%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Tickets Sold",
    value: "1,204",
    delta: "+6.1%",
    trend: "up",
    icon: Ticket,
  },
  {
    label: "Active Movies",
    value: "18",
    delta: "-2",
    trend: "down",
    icon: Film,
  },
  {
    label: "New Customers",
    value: "342",
    delta: "+18.9%",
    trend: "up",
    icon: Users,
  },
];

interface RecentBooking {
  id: string;
  customer: string;
  movie: string;
  seats: number;
  amount: string;
  time: string;
}

const RECENT_BOOKINGS: RecentBooking[] = [
  {
    id: "BK-4821",
    customer: "Sophea Ly",
    movie: "Edge of Tomorrow Land",
    seats: 2,
    amount: "$14.00",
    time: "2 min ago",
  },
  {
    id: "BK-4820",
    customer: "Marc Rivera",
    movie: "Circuit Breaker",
    seats: 4,
    amount: "$28.00",
    time: "9 min ago",
  },
  {
    id: "BK-4819",
    customer: "Dara Chan",
    movie: "The Quiet Harbor",
    seats: 1,
    amount: "$7.00",
    time: "17 min ago",
  },
  {
    id: "BK-4818",
    customer: "Priya Nair",
    movie: "Neon Alley",
    seats: 3,
    amount: "$21.00",
    time: "31 min ago",
  },
  {
    id: "BK-4817",
    customer: "Tola Sok",
    movie: "The Last Monsoon",
    seats: 2,
    amount: "$14.00",
    time: "48 min ago",
  },
];

interface UpcomingShow {
  movie: string;
  screen: string;
  time: string;
  occupancy: number; // 0-100
}

const UPCOMING_SHOWS: UpcomingShow[] = [
  {
    movie: "Edge of Tomorrow Land",
    screen: "Screen 1",
    time: "4:30 PM",
    occupancy: 82,
  },
  {
    movie: "Circuit Breaker",
    screen: "IMAX Hall",
    time: "5:00 PM",
    occupancy: 64,
  },
  { movie: "Neon Alley", screen: "Screen 3", time: "6:15 PM", occupancy: 41 },
  {
    movie: "The Quiet Harbor",
    screen: "Screen 2",
    time: "7:00 PM",
    occupancy: 90,
  },
];

// Weekly revenue, purely for the inline sparkline bars below.
const WEEKLY_REVENUE = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 44 },
  { day: "Thu", value: 61 },
  { day: "Fri", value: 78 },
  { day: "Sat", value: 95 },
  { day: "Sun", value: 71 },
];

function StatCard({ label, value, delta, trend, icon: Icon }: StatCardData) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-md bg-rose-50 flex items-center justify-center">
          <Icon size={17} className="text-rose-600" strokeWidth={2} />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-medium ${
            trend === "up" ? "text-emerald-600" : "text-rose-500"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {delta}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function DashboardHome() {
  const maxRevenue = Math.max(...WEEKLY_REVENUE.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Good afternoon, Jamie
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Here's what's happening across your theatres today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Revenue + upcoming shows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly revenue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-slate-900">
                Revenue this week
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compared to last week
              </p>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700">
              View report
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex items-end justify-between gap-3 h-40">
            {WEEKLY_REVENUE.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex items-end justify-center h-32">
                  <div
                    className="w-full max-w-8 rounded-t-sm bg-rose-100 hover:bg-rose-200 transition-colors"
                    style={{
                      height: `${(d.value / maxRevenue) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming showtimes */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-4">
            Upcoming showtimes
          </h3>
          <ul className="space-y-4">
            {UPCOMING_SHOWS.map((show) => (
              <li key={`${show.movie}-${show.time}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {show.movie}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {show.time} · {show.screen}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0 ml-2">
                    {show.occupancy}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${show.occupancy}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-medium text-slate-900">
            Recent bookings
          </h3>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700">
            View all
            <ArrowUpRight size={13} />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-2.5 text-left font-medium text-slate-500">
                Booking
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-500">
                Customer
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-slate-500">
                Movie
              </th>
              <th className="px-5 py-2.5 text-center font-medium text-slate-500">
                Seats
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-slate-500">
                Amount
              </th>
              <th className="px-5 py-2.5 text-right font-medium text-slate-500">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {RECENT_BOOKINGS.map((b) => (
              <tr
                key={b.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-5 py-3 text-slate-500">{b.id}</td>
                <td className="px-5 py-3 font-medium text-slate-900">
                  {b.customer}
                </td>
                <td className="px-5 py-3 text-slate-600">{b.movie}</td>
                <td className="px-5 py-3 text-center text-slate-600">
                  {b.seats}
                </td>
                <td className="px-5 py-3 text-right font-medium text-slate-900">
                  {b.amount}
                </td>
                <td className="px-5 py-3 text-right text-slate-400">
                  {b.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardHome;
