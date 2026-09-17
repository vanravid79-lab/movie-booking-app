import { useState, useEffect, type FormEvent } from "react";
import { adminApi, type SchedulePayload } from "../services/adminApi";
import type {
  AdminSchedule,
  AdminCinema,
  AdminHall,
} from "../types/admin.types";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [cinemas, setCinemas] = useState<AdminCinema[]>([]);
  const [halls, setHalls] = useState<AdminHall[]>([]);

  const [selectedCinemaId, setSelectedCinemaId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating a new schedule
  const [form, setForm] = useState<SchedulePayload>({
    movie_id: 969681, // Can later be changed to a movie selector input
    hall_id: 0,
    schedule_date: "2026-09-03",
    start_time: "14:30:00",
    end_time: "16:45:00",
    ticket_price: 12.5,
    status: "Scheduled",
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [fetchedSchedules, fetchedCinemas] = await Promise.all([
        adminApi.getSchedules(),
        adminApi.getCinemas(),
      ]);
      setSchedules(fetchedSchedules);
      setCinemas(fetchedCinemas);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(loadAdminData, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  // Fetch halls automatically when a cinema is selected
  const handleCinemaChange = async (cinemaId: number) => {
    setSelectedCinemaId(cinemaId);
    try {
      const fetchedHalls = await adminApi.getHalls(cinemaId);
      setHalls(fetchedHalls);
      if (fetchedHalls.length > 0) {
        setForm((prev) => ({ ...prev, hall_id: fetchedHalls[0].hall_id }));
      }
    } catch (err: unknown) {
      console.error("Failed to fetch halls", err);
      setHalls([]);
    }
  };

  const handleCreateSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.hall_id) {
      alert("Please select a valid hall.");
      return;
    }
    try {
      await adminApi.createSchedule(form);
      alert("Schedule created successfully!");
      loadAdminData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to create schedule"));
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      await adminApi.deleteSchedule(scheduleId);
      setSchedules(schedules.filter((s) => s.schedule_id !== scheduleId));
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to delete schedule"));
    }
  };

  if (loading) {
    return <div className="p-6 text-zinc-400">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="space-y-8 p-6 text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-amber-400">
        Manage Schedules
      </h1>

      {/* CREATE SCHEDULE FORM */}
      <form
        onSubmit={handleCreateSchedule}
        className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6"
      >
        <h2 className="text-xl font-semibold">Add New Showtime</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Movie ID (TMDB)
            </label>
            <input
              type="number"
              value={form.movie_id}
              onChange={(e) =>
                setForm({ ...form, movie_id: Number(e.target.value) })
              }
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Select Cinema
            </label>
            <select
              value={selectedCinemaId}
              onChange={(e) => handleCinemaChange(Number(e.target.value))}
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
            >
              <option value="">-- Choose Cinema --</option>
              {cinemas.map((cinema) => (
                <option key={cinema.cinema_id} value={cinema.cinema_id}>
                  {cinema.cinema_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Select Hall
            </label>
            <select
              value={form.hall_id}
              onChange={(e) =>
                setForm({ ...form, hall_id: Number(e.target.value) })
              }
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
              disabled={!selectedCinemaId}
            >
              <option value="">-- Choose Hall --</option>
              {halls.map((hall) => (
                <option key={hall.hall_id} value={hall.hall_id}>
                  {hall.hall_name} ({hall.hall_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Date</label>
            <input
              type="date"
              value={form.schedule_date}
              onChange={(e) =>
                setForm({ ...form, schedule_date: e.target.value })
              }
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Start Time (HH:mm:ss)
            </label>
            <input
              type="text"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Ticket Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.ticket_price}
              onChange={(e) =>
                setForm({ ...form, ticket_price: Number(e.target.value) })
              }
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
        >
          Create Showtime
        </button>
      </form>

      {/* SCHEDULES TABLE */}
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Movie ID</th>
              <th className="p-4">Cinema / Hall</th>
              <th className="p-4">Date</th>
              <th className="p-4">Time</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-zinc-500">
                  No schedules found in database.
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.schedule_id} className="hover:bg-zinc-900/50">
                  <td className="p-4 font-mono">{schedule.schedule_id}</td>
                  <td className="p-4 font-mono">{schedule.movie_id}</td>
                  <td className="p-4">
                    {schedule.hall?.cinema?.cinema_name ?? "N/A"} -{" "}
                    <span className="text-zinc-400">
                      {schedule.hall?.hall_name ?? "Hall " + schedule.hall_id}
                    </span>
                  </td>
                  <td className="p-4">
                    {schedule.schedule_date.split("T")[0]}
                  </td>
                  <td className="p-4">
                    {schedule.start_time} - {schedule.end_time}
                  </td>
                  <td className="p-4 font-semibold text-amber-400">
                    ${Number(schedule.ticket_price).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(schedule.schedule_id)}
                      className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
