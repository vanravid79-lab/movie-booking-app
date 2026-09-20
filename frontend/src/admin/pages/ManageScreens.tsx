import { useEffect, useState } from "react";
import {
  Armchair,
  Building2,
  Monitor,
  CheckCircle2,
  Search,
  Filter,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

interface SeatItem {
  seat_id: number;
  seat_number: string;
  seat_type: string;
  seat_status: string;
}

interface HallItem {
  hall_id: number;
  hall_name: string;
  hall_type: string;
  hall_capacity: number;
  hall_status: string;
  cinema: {
    cinema_id: number;
    cinema_name: string;
    cinema_location: string;
  };
  seats: SeatItem[];
  _count: {
    schedules: number;
    seats: number;
  };
}

export default function ManageScreens() {
  const [halls, setHalls] = useState<HallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [cinemaFilter, setCinemaFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${API_URL}/admin/screens`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHalls(data);
          if (data.length > 0) setSelectedHallId(data[0].hall_id);
        }
      })
      .catch((err) => console.error("Failed to load screens:", err))
      .finally(() => setLoading(false));
  }, []);

  const uniqueCinemas = Array.from(
    new Set(halls.map((h) => h.cinema.cinema_name)),
  );

  const filteredHalls = halls.filter(
    (h) =>
      cinemaFilter === "all" || h.cinema.cinema_name === cinemaFilter,
  );

  const selectedHall = halls.find((h) => h.hall_id === selectedHallId);

  // Group seats of selected hall into rows
  const seatRows = selectedHall
    ? Array.from(
        selectedHall.seats.reduce((acc, seat) => {
          const row = seat.seat_number.match(/^[A-Z]+/)?.[0] || "A";
          acc.set(row, [...(acc.get(row) || []), seat]);
          return acc;
        }, new Map<string, SeatItem[]>()),
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Screens & Seat Layouts</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage theatre auditoriums, screen types, and seating capacity
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select
            value={cinemaFilter}
            onChange={(e) => setCinemaFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-[#18181f] px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
          >
            <option value="all">All Theatres ({halls.length} screens)</option>
            {uniqueCinemas.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          Loading screens and seating maps...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Halls List */}
          <div className="space-y-3">
            {filteredHalls.map((hall) => {
              const isSelected = hall.hall_id === selectedHallId;
              return (
                <button
                  key={hall.hall_id}
                  type="button"
                  onClick={() => setSelectedHallId(hall.hall_id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-950/20"
                      : "border-zinc-800 bg-[#18181f] hover:border-zinc-700 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {hall.hall_name}
                        </span>
                        <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                          {hall.hall_type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                        <Building2 size={12} className="text-rose-400 shrink-0" />
                        {hall.cinema.cinema_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                        <Armchair size={13} />
                        {hall.seats.length || hall.hall_capacity} seats
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {hall._count.schedules} shows scheduled
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hall Seat Map Preview */}
          {selectedHall ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#18181f] p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {selectedHall.hall_name} — Seat Map
                    </h3>
                    <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                      {selectedHall.hall_type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedHall.cinema.cinema_name} • {selectedHall.cinema.cinema_location}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-zinc-700 border border-zinc-600 inline-block" />
                    <span className="text-zinc-400">Standard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-amber-400 border border-amber-300 inline-block" />
                    <span className="text-zinc-400">VIP</span>
                  </div>
                </div>
              </div>

              {/* Screen Bar */}
              <div className="max-w-md mx-auto text-center space-y-2 pt-2">
                <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  <Monitor size={12} />
                  Auditorium Screen
                </div>
              </div>

              {/* Seating Grid */}
              <div className="space-y-2.5 overflow-x-auto py-4">
                {seatRows.map(([row, seats]) => (
                  <div
                    key={row}
                    className="flex min-w-max items-center justify-center gap-2"
                  >
                    <span className="w-5 text-center text-xs font-bold text-zinc-500">
                      {row}
                    </span>
                    <div className="flex gap-1.5">
                      {seats.map((seat) => {
                        const isVip = seat.seat_type === "VIP";
                        return (
                          <div
                            key={seat.seat_id}
                            title={`${seat.seat_number} - ${seat.seat_type}`}
                            className={`flex h-8 w-8 items-center justify-center rounded-t-md text-[10px] font-bold border transition ${
                              isVip
                                ? "border-amber-400/40 bg-amber-400/20 text-amber-300 hover:border-amber-400 hover:bg-amber-400/40"
                                : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700"
                            }`}
                          >
                            {seat.seat_number}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend & Details */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
                <div>
                  Rows A–E: <strong className="text-white">Standard Tier</strong> (50 seats)
                </div>
                <div>
                  Rows F–H: <strong className="text-amber-300">VIP Recliner Tier</strong> (30 seats)
                </div>
                <div>
                  Total Capacity: <strong className="text-emerald-400">80 Seats</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
              Select a screen from the left to view its seating arrangement.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
