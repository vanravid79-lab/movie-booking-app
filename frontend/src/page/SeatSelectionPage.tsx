import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Armchair,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Monitor,
} from "lucide-react";

export interface Seat {
  seat_id: number;
  seat_number: string;
  seat_type: string | null;
  seat_status: "Available" | "Maintenance" | null;
  is_booked: boolean;
}

export interface ScheduleInfo {
  movie_title: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
  hall_name: string;
  hall_type: string | null;
  cinema_name: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

const formatTime = (value: string) => value.slice(0, 5);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export default function SeatSelectionPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId) {
      return;
    }

    const controller = new AbortController();
    fetch(`${API_URL}/schedules/${scheduleId}/seats`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to load seats.");
        return data;
      })
      .then((data: { schedule: ScheduleInfo; seats: Seat[] }) => {
        setSchedule(data.schedule);
        setSeats(data.seats);
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof Error &&
          requestError.name !== "AbortError"
        ) {
          setError(requestError.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [scheduleId]);

  const rows = useMemo(() => {
    const grouped = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const row = seat.seat_number.match(/^[A-Z]+/)?.[0] || "A";
      grouped.set(row, [...(grouped.get(row) || []), seat]);
    });
    return Array.from(grouped.entries());
  }, [seats]);

  const toggleSeat = (seat: Seat) => {
    if (seat.is_booked || seat.seat_status !== "Available") return;
    setSelectedSeatIds((current) =>
      current.includes(seat.seat_id)
        ? current.filter((id) => id !== seat.seat_id)
        : [...current, seat.seat_id],
    );
  };

  const handleContinue = () => {
    if (!localStorage.getItem("cambo_token")) {
      navigate("/login", {
        state: { from: `/booking/${scheduleId}` },
      });
      return;
    }

    navigate(`/checkout/${scheduleId}`, {
      state: {
        schedule,
        seats: seats.filter((seat) => selectedSeatIds.includes(seat.seat_id)),
      },
    });
  };

  if (!scheduleId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-red-400">
        Showtime not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        Loading seats...
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-red-400">
        {error || "Showtime not found."}
      </div>
    );
  }

  const total = selectedSeatIds.length * Number(schedule.ticket_price);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#27201a_0,#090909_38%,#000_75%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to showtimes
        </button>
        <header className="border-b border-white/10 pb-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                Choose your experience
              </p>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Select your seats
              </h1>
              <p className="mt-2 text-zinc-400">{schedule.movie_title}</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 sm:self-auto">
              <Armchair className="h-4 w-4" />
              {seats.length} seats in this hall
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              {schedule.cinema_name}
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-amber-400" />
              {schedule.hall_name} · {schedule.hall_type || "Standard"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-400" />
              {formatDate(schedule.schedule_date)} ·{" "}
              <Clock3 className="h-4 w-4 text-amber-400" />
              {formatTime(schedule.start_time)}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <section className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/30 sm:p-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="h-1 rounded-full bg-linear-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_24px_rgba(251,191,36,0.45)]" />
              <div className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
                <Monitor className="h-3.5 w-3.5" /> Screen
              </div>
            </div>
            <div className="space-y-3 overflow-x-auto pb-2">
              {rows.map(([row, rowSeats]) => (
                <div
                  key={row}
                  className="mx-auto flex min-w-max items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="w-5 text-xs font-semibold text-zinc-600">
                    {row}
                  </span>
                  {rowSeats.map((seat) => {
                    const selected = selectedSeatIds.includes(seat.seat_id);
                    const unavailable =
                      seat.is_booked || seat.seat_status !== "Available";
                    return (
                      <button
                        key={seat.seat_id}
                        type="button"
                        disabled={unavailable}
                        onClick={() => toggleSeat(seat)}
                        aria-label={`Seat ${seat.seat_number}`}
                        aria-pressed={selected}
                        className={`relative h-9 w-9 rounded-t-md border text-[10px] font-bold transition-all duration-200 sm:h-10 sm:w-10 ${selected ? "border-amber-200 bg-amber-400 text-black shadow-lg shadow-amber-400/25" : unavailable ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-700" : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-400/80 hover:text-black"}`}
                      >
                        {selected ? (
                          <Check className="mx-auto h-4 w-4" />
                        ) : (
                          seat.seat_number
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/5 pt-5 text-xs text-zinc-400">
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-zinc-800 ring-1 ring-zinc-600" />
                Available
              </span>
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-amber-400" />
                Selected
              </span>
              <span>
                <i className="mr-2 inline-block h-3 w-3 rounded-sm bg-zinc-900 ring-1 ring-zinc-800" />
                Unavailable
              </span>
            </div>
          </section>

          <aside className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl shadow-black/20 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Armchair className="h-5 w-5 text-amber-400" />
              <h2 className="font-semibold text-white">Your booking</h2>
            </div>
            <dl className="space-y-3 py-5 text-sm">
              <div className="flex justify-between gap-4 text-zinc-400">
                <dt>Ticket price</dt>
                <dd className="text-white">
                  ${Number(schedule.ticket_price).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-zinc-400">
                <dt>Selected seats</dt>
                <dd className="text-white">{selectedSeatIds.length}</dd>
              </div>
            </dl>
            <div className="flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-zinc-400">Total</span>
              <strong className="text-2xl text-amber-400">
                ${total.toFixed(2)}
              </strong>
            </div>
            <button
              type="button"
              disabled={selectedSeatIds.length === 0}
              onClick={handleContinue}
              className="mt-5 flex w-full items-center justify-center rounded-lg bg-amber-400 px-5 py-3 font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to checkout
            </button>
            <p className="mt-3 text-center text-[11px] text-zinc-600">
              Seats are held while you complete your booking.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
