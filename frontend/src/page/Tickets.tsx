import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket as TicketIcon,
  CalendarDays,
  Clock3,
  MapPin,
  Monitor,
  Printer,
  Sparkles,
  Film,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

interface TicketItem {
  booking_id: number;
  booking_date: string;
  total_amount: number;
  booking_status: string;
  ticket_number: string;
  ticket_status: string;
  movie: {
    id: number;
    title: string;
    poster: string | null;
    duration: number | null;
    rating: number | null;
  };
  schedule: {
    schedule_id: number;
    date: string;
    start_time: string;
    end_time: string;
    price: number;
  };
  cinema: {
    name: string;
    location: string | null;
    phone: string | null;
  };
  hall: {
    name: string;
    type: string | null;
  };
  seats: {
    seat_id: number;
    seat_number: string;
    seat_type: string | null;
    seat_price: number;
  }[];
  foods: {
    name: string;
    quantity: number;
    price: number;
  }[];
  payment: {
    method: string;
    status: string;
    amount: number;
  } | null;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatTime = (value: string) => value.slice(0, 5);

export default function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const token = localStorage.getItem("cambo_token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/bookings/my-tickets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load tickets.");
        }
        return data;
      })
      .then((data) => {
        setTickets(data.tickets || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load tickets.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true;
    // active means schedule date is today or in future
    const showDate = new Date(ticket.schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return showDate >= today;
  });

  const handlePrint = () => {
    window.print();
  };

  if (!token) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400 shadow-xl shadow-amber-400/10">
            <TicketIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold">Your Digital Tickets</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in to view your booked tickets, seat passes, and cinema QR codes.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/login"
              state={{ from: "/tickets" }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3 font-bold text-black shadow-lg shadow-amber-400/25 transition hover:brightness-105"
            >
              Sign In to View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2b2118_0%,#0e0f12_32%,#050505_75%)] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Movie Passes
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">My Cinema Tickets</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Show your digital ticket barcode at the cinema counter or hall entrance.
            </p>
          </div>

          {tickets.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/80 p-1">
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  filter === "active"
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Upcoming ({tickets.filter((t) => new Date(t.schedule.date) >= new Date()).length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  filter === "all"
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Bookings ({tickets.length})
              </button>
            </div>
          )}
        </header>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 py-12 text-center text-zinc-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-sm">Loading your tickets...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTickets.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/50 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-zinc-500">
              <Film className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-bold text-white">No Tickets Found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
              {filter === "active"
                ? "You have no upcoming movie tickets. Browse movies to book your next show!"
                : "You haven't booked any movies yet."}
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-amber-400/20 hover:bg-amber-300"
              >
                Browse Now Showing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {!loading && !error && filteredTickets.length > 0 && (
          <div className="space-y-6">
            {filteredTickets.map((t) => (
              <article
                key={t.booking_id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl transition hover:border-amber-400/30"
              >
                <div className="grid lg:grid-cols-[1fr_260px]">
                  {/* Ticket Main Info */}
                  <div className="flex flex-col gap-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      {t.movie.poster ? (
                        <img
                          src={t.movie.poster}
                          alt={t.movie.title}
                          className="h-36 w-24 shrink-0 rounded-xl object-cover shadow-lg ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-36 w-24 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-600">
                          <Film className="h-8 w-8" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                            {t.ticket_status || "Confirmed"}
                          </span>
                          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                            {t.hall.type || "Standard"}
                          </span>
                          {t.movie.rating && (
                            <span className="text-xs font-semibold text-amber-400">
                              ★ {t.movie.rating}
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition">
                          {t.movie.title}
                        </h2>

                        <p className="flex items-center gap-2 text-sm text-zinc-300">
                          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                          <span>{t.cinema.name}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{t.hall.name}</span>
                        </p>

                        <div className="flex flex-wrap gap-y-1 gap-x-4 pt-1 text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
                            {formatDate(t.schedule.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                            {formatTime(t.schedule.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seats & Snacks Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                          Reserved Seats ({t.seats.length})
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {t.seats.map((s) => (
                            <span
                              key={s.seat_id}
                              className="rounded-lg border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300"
                            >
                              {s.seat_number}
                              {s.seat_type === "VIP" && (
                                <span className="ml-1 text-[9px] text-amber-400/80">(VIP)</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {t.foods.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Food & Drinks
                          </span>
                          <p className="mt-1 text-xs text-zinc-300">
                            {t.foods.map((f) => `${f.name} (x${f.quantity})`).join(", ")}
                          </p>
                        </div>
                      )}

                      <div className="text-right">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                          Total Paid
                        </span>
                        <p className="text-xl font-bold text-amber-400">
                          ${t.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Stub / QR Code Section */}
                  <div className="relative flex flex-col items-center justify-between border-t border-dashed border-white/15 bg-zinc-900/70 p-6 text-center lg:border-t-0 lg:border-l">
                    {/* Top Notch Decoration for Cinema Pass */}
                    <div className="hidden lg:block absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#0e0f12]" />
                    <div className="hidden lg:block absolute -left-3 -bottom-3 h-6 w-6 rounded-full bg-[#050505]" />

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                        Boarding Pass
                      </p>
                      <p className="font-mono text-sm font-black tracking-wider text-white">
                        {t.ticket_number}
                      </p>
                    </div>

                    {/* QR Code Illustration */}
                    <div className="my-4 rounded-2xl bg-white p-3 shadow-xl">
                      <svg className="h-28 w-28" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#ffffff" />
                        <path fill="#000000" d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" />
                        <path fill="#000000" d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" />
                        <path fill="#000000" d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" />
                        <path fill="#000000" d="M42,12 h6 v6 h-6 z M52,12 h6 v6 h-6 z M42,22 h16 v6 h-16 z M42,32 h6 v6 h-6 z" />
                        <path fill="#000000" d="M12,42 h6 v6 h-6 z M22,42 h16 v6 h-16 z M12,52 h6 v6 h-6 z M32,52 h6 v6 h-6 z" />
                        <path fill="#000000" d="M65,42 h16 v6 h-16 z M72,52 h6 v6 h-6 z M82,42 h6 v16 h-6 z" />
                        <path fill="#000000" d="M42,65 h6 v16 h-6 z M52,72 h6 v6 h-6 z M42,85 h16 v6 h-16 z" />
                        <path fill="#000000" d="M65,65 h6 v6 h-6 z M75,65 h12 v6 h-12 z M72,75 h6 v16 h-6 z M82,82 h6 v6 h-6 z" />
                        <circle cx="50" cy="50" r="8" fill="#d97706" />
                        <text x="50" y="53" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">★</text>
                      </svg>
                    </div>

                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Scan at Gate
                      </div>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print / Save Pass
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
