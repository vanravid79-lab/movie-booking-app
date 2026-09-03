import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Session {
  scheduleId: number;
  startTime: string;
  hallName: string;
  hallType: string;
  ticketPrice: number;
}

interface CinemaGroup {
  cinemaId: number;
  cinemaName: string;
  cinemaLocation: string;
  sessions: Session[];
}

export default function MovieShowtimes() {
  const { id: movieId } = useParams();
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState<CinemaGroup[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(true);

  // Example selected date state (adjust according to your component implementation)
  const [selectedDate, setSelectedDate] = useState({
    label: "Today",
    date: "2026-09-03",
  });

  const formatTime = (timeString: string) => {
    // Converts "14:30:00" to "2:30 PM" or trims seconds if desired
    return timeString.slice(0, 5);
  };

  const fetchShowtimes = async () => {
    try {
      setShowtimesLoading(true);
      // Fetching from your backend route linked to PostgreSQL
      const response = await fetch(
        `http://localhost:5059/api/movies/${movieId}/schedules`,
      );
      if (!response.ok) throw new Error("Failed to fetch showtimes");

      const flatSchedules = await response.json();

      // Group flat database results by Cinema
      const cinemaMap = new Map();

      flatSchedules.forEach((item: any) => {
        const cinema = item.hall?.cinema;
        if (!cinema) return;

        if (!cinemaMap.has(cinema.cinema_id)) {
          cinemaMap.set(cinema.cinema_id, {
            cinemaId: cinema.cinema_id,
            cinemaName: cinema.cinema_name,
            cinemaLocation: cinema.cinema_location || "Main Location",
            sessions: [],
          });
        }

        cinemaMap.get(cinema.cinema_id).sessions.push({
          scheduleId: item.schedule_id,
          startTime: item.start_time,
          hallName: item.hall.hall_name,
          hallType: item.hall.hall_type ?? "Standard",
          ticketPrice: item.ticket_price,
        });
      });

      setShowtimes(Array.from(cinemaMap.values()));
    } catch (err) {
      console.error("Failed to load showtimes", err);
    } finally {
      setShowtimesLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId, selectedDate]);

  return (
    <section className="space-y-6">
      {showtimesLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <span>Loading showtimes...</span>
          </div>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 text-center text-zinc-500">
          No showtimes available for{" "}
          <span className="font-semibold text-amber-400">
            {selectedDate.label}
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {showtimes.map((cinema) => (
            <div
              key={cinema.cinemaId}
              className="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6 shadow-sm"
            >
              {/* CINEMA HEADER */}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {cinema.cinemaName}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {cinema.cinemaLocation}
                </p>
              </div>

              {/* SESSIONS BUTTONS */}
              <div className="flex flex-wrap gap-3">
                {cinema.sessions.map((session) => (
                  <button
                    key={session.scheduleId}
                    type="button"
                    onClick={() => navigate(`/booking/${session.scheduleId}`)}
                    className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 cursor-pointer"
                  >
                    <span className="text-base font-semibold text-amber-400">
                      {formatTime(session.startTime)}
                    </span>

                    <span className="text-xs text-zinc-400">
                      {session.hallName} ({session.hallType})
                    </span>

                    <span className="mt-1 text-xs font-medium text-white">
                      ${Number(session.ticketPrice).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
