import { useState, useEffect } from "react";

interface Cinema {
  cinema_id: number;
  cinema_name: string;
  cinema_location?: string;
  cinema_phone?: string;
}

interface Hall {
  hall_id: number;
  hall_name: string;
  hall_type?: string;
  hall_capacity?: number;
  cinema?: Cinema;
}

interface Schedule {
  schedule_id: number;
  movie_id: number;
  hall_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  ticket_price: number;
  hall?: Hall;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5059/api/admin/schedules");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Schedule[] = await response.json();
      setSchedules(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load schedules", err);
      setError(err.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <span>Loading schedules...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
        <p className="font-semibold">Error Loading Content</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-zinc-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-amber-400 tracking-tight">
            Movie Schedules
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage and view all active cinema showtimes.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
          Total: {schedules.length}
        </span>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50">
          <p className="text-zinc-500 text-sm">
            No active schedules available in the database.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.schedule_id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-900/40"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    ID: {schedule.schedule_id}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    TMDB: {schedule.movie_id}
                  </span>
                </div>
                <div className="text-base font-semibold text-zinc-200">
                  {schedule.hall?.cinema?.cinema_name ?? "Unknown Cinema"}
                  <span className="text-zinc-500 font-normal mx-2">/</span>
                  <span className="text-amber-400/90">
                    {schedule.hall?.hall_name ?? `Hall ${schedule.hall_id}`}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-3">
                  <span>📅 {schedule.schedule_date.split("T")[0]}</span>
                  <span>
                    ⏰ {schedule.start_time} - {schedule.end_time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-900">
                <div className="text-right">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">
                    Price
                  </div>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    ${Number(schedule.ticket_price).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
