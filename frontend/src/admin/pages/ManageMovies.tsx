import React, { useState } from "react";
import DataTable, { Column } from "../component/DataTable";
import { Plus, Pencil, Trash2, X, Star, Film } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number; // minutes
  rating: number; // 0-10
  language: string;
  status: "Now Showing" | "Coming Soon" | "Ended";
}

const INITIAL_MOVIES: Movie[] = [
  {
    id: "mv-001",
    title: "Edge of Tomorrow Land",
    genre: "Sci-Fi / Action",
    duration: 128,
    rating: 8.2,
    language: "English",
    status: "Now Showing",
  },
  {
    id: "mv-002",
    title: "The Last Monsoon",
    genre: "Drama",
    duration: 141,
    rating: 7.6,
    language: "Khmer",
    status: "Now Showing",
  },
  {
    id: "mv-003",
    title: "Neon Alley",
    genre: "Thriller",
    duration: 104,
    rating: 6.9,
    language: "English",
    status: "Now Showing",
  },
  {
    id: "mv-004",
    title: "Grandma's Recipe",
    genre: "Comedy / Family",
    duration: 96,
    rating: 7.1,
    language: "Khmer",
    status: "Coming Soon",
  },
  {
    id: "mv-005",
    title: "Iron Horizon",
    genre: "Action",
    duration: 132,
    rating: 8.5,
    language: "English",
    status: "Coming Soon",
  },
  {
    id: "mv-006",
    title: "Whispers in the Reef",
    genre: "Documentary",
    duration: 88,
    rating: 7.9,
    language: "English",
    status: "Ended",
  },
];

type MovieFormData = Omit<Movie, "id">;

const EMPTY_FORM: MovieFormData = {
  title: "",
  genre: "",
  duration: 90,
  rating: 7,
  language: "English",
  status: "Coming Soon",
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function StatusBadge({ status }: { status: Movie["status"] }) {
  const styles: Record<Movie["status"], string> = {
    "Now Showing": "bg-emerald-50 text-emerald-700",
    "Coming Soon": "bg-amber-50 text-amber-700",
    Ended: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface MovieModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MovieFormData) => void;
  initialData?: MovieFormData;
}

function MovieModal({ open, onClose, onSubmit, initialData }: MovieModalProps) {
  const [form, setForm] = useState<MovieFormData>(initialData ?? EMPTY_FORM);

  React.useEffect(() => {
    if (open) setForm(initialData ?? EMPTY_FORM);
  }, [open, initialData]);

  if (!open) return null;

  const update = <K extends keyof MovieFormData>(
    key: K,
    value: MovieFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.title.trim() && form.genre.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl shadow-slate-900/10 border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center">
              <Film size={16} className="text-rose-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {initialData ? "Edit Movie" : "Add Movie"}
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

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Skyline Runners"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Genre
            </label>
            <input
              type="text"
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              placeholder="e.g. Action / Adventure"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Duration (min)
              </label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => update("duration", Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Rating (0-10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={form.rating}
                onChange={(e) => update("rating", Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as Movie["status"])
                }
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              >
                <option>Now Showing</option>
                <option>Coming Soon</option>
                <option>Ended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-md bg-rose-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-colors"
            >
              {initialData ? "Save Changes" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageMovies() {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingMovie = movies.find((m) => m.id === editingId);

  const openAddModal = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (data: MovieFormData) => {
    if (editingId) {
      setMovies((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...data } : m)),
      );
    } else {
      setMovies((prev) => [{ id: `mv-${Date.now()}`, ...data }, ...prev]);
    }
    setModalOpen(false);
  };

  const columns: Column<Movie>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-400">{row.genre}</p>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => formatDuration(row.duration),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center gap-1 justify-center">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {row.rating.toFixed(1)}
        </span>
      ),
    },
    { key: "language", header: "Language" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "id",
      header: "",
      sortable: false,
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEditModal(row.id)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-5 py-4 shadow-sm shadow-slate-900/[0.02]">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Manage Movies
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {movies.length} titles in your catalog
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add Movie
        </button>
      </div>

      <DataTable<Movie>
        columns={columns}
        data={movies}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by title, genre, language..."
        searchableKeys={["title", "genre", "language", "status"]}
        pageSize={6}
      />

      <MovieModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={
          editingMovie
            ? {
                title: editingMovie.title,
                genre: editingMovie.genre,
                duration: editingMovie.duration,
                rating: editingMovie.rating,
                language: editingMovie.language,
                status: editingMovie.status,
              }
            : undefined
        }
      />
    </div>
  );
}

export default ManageMovies;
