import React, { useState } from "react";
import { X, Calendar, Clock, Film, MonitorPlay, Ticket } from "lucide-react";

export interface ScheduleFormData {
  movie: string;
  screen: string;
  date: string;
  time: string;
  price: number;
  language: string;
}

interface ScheduleModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal should close (backdrop click, X, or Cancel). */
  onClose: () => void;
  /** Called with the form data when the user submits. */
  onSubmit?: (data: ScheduleFormData) => void;
  /** Movie titles to choose from. */
  movies?: string[];
  /** Screen names to choose from. */
  screens?: string[];
  /** Pre-filled values, e.g. when editing an existing showtime. */
  initialData?: Partial<ScheduleFormData>;
}

const DEFAULT_MOVIES = [
  "Edge of Tomorrow Land",
  "The Last Monsoon",
  "Neon Alley",
  "Circuit Breaker",
  "The Quiet Harbor",
];

const DEFAULT_SCREENS = ["Screen 1", "Screen 2", "Screen 3", "IMAX Hall"];

function ScheduleModal({
  open,
  onClose,
  onSubmit = () => {},
  movies = DEFAULT_MOVIES,
  screens = DEFAULT_SCREENS,
  initialData,
}: ScheduleModalProps) {
  const [form, setForm] = useState<ScheduleFormData>({
    movie: initialData?.movie ?? movies[0] ?? "",
    screen: initialData?.screen ?? screens[0] ?? "",
    date: initialData?.date ?? "",
    time: initialData?.time ?? "",
    price: initialData?.price ?? 6,
    language: initialData?.language ?? "English",
  });

  if (!open) return null;

  const update = <K extends keyof ScheduleFormData>(
    key: K,
    value: ScheduleFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isValid = form.movie && form.screen && form.date && form.time;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl shadow-slate-900/10 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center">
              <Ticket size={16} className="text-rose-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              Schedule Showtime
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
              <Film size={13} /> Movie
            </label>
            <select
              value={form.movie}
              onChange={(e) => update("movie", e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            >
              {movies.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
              <MonitorPlay size={13} /> Screen
            </label>
            <select
              value={form.screen}
              onChange={(e) => update("screen", e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            >
              {screens.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Calendar size={13} /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Clock size={13} /> Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Ticket Price ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Language
              </label>
              <select
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              >
                <option>English</option>
                <option>Khmer</option>
                <option>Subtitled</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-md bg-rose-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save Showtime
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;
