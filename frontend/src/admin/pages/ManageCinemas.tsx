import React, { useState } from "react";
import DataTable from "../component/DataTable";
import type { Column } from "../component/DataTable";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  MapPin,
  Armchair,
} from "lucide-react";

interface Cinema {
  id: string;
  name: string;
  location: string;
  screens: number;
  seats: number;
  status: "Active" | "Maintenance" | "Closed";
}

const INITIAL_CINEMAS: Cinema[] = [
  {
    id: "cn-001",
    name: "CineDesk Riverside",
    location: "Phnom Penh, Chamkarmon",
    screens: 6,
    seats: 840,
    status: "Active",
  },
  {
    id: "cn-002",
    name: "CineDesk Skypark",
    location: "Phnom Penh, Sen Sok",
    screens: 8,
    seats: 1120,
    status: "Active",
  },
  {
    id: "cn-003",
    name: "CineDesk Old Town",
    location: "Siem Reap, Central",
    screens: 4,
    seats: 520,
    status: "Maintenance",
  },
  {
    id: "cn-004",
    name: "CineDesk Harbor View",
    location: "Sihanoukville, Downtown",
    screens: 5,
    seats: 610,
    status: "Active",
  },
  {
    id: "cn-005",
    name: "CineDesk Northgate",
    location: "Battambang, Central",
    screens: 3,
    seats: 380,
    status: "Closed",
  },
];

type CinemaFormData = Omit<Cinema, "id">;

const EMPTY_FORM: CinemaFormData = {
  name: "",
  location: "",
  screens: 1,
  seats: 100,
  status: "Active",
};

function StatusBadge({ status }: { status: Cinema["status"] }) {
  const styles: Record<Cinema["status"], string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Maintenance: "bg-amber-50 text-amber-700",
    Closed: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface CinemaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CinemaFormData) => void;
  initialData?: CinemaFormData;
}

function CinemaModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: CinemaModalProps) {
  const [form, setForm] = useState<CinemaFormData>(initialData ?? EMPTY_FORM);

  React.useEffect(() => {
    if (open) setForm(initialData ?? EMPTY_FORM);
  }, [open, initialData]);

  if (!open) return null;

  const update = <K extends keyof CinemaFormData>(
    key: K,
    value: CinemaFormData[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.name.trim() && form.location.trim();

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
              <Building2 size={16} className="text-rose-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {initialData ? "Edit Cinema" : "Add Cinema"}
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
              Cinema name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. CineDesk Northgate"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Phnom Penh, Chamkarmon"
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Screens
              </label>
              <input
                type="number"
                min={1}
                value={form.screens}
                onChange={(e) => update("screens", Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Total seats
              </label>
              <input
                type="number"
                min={1}
                value={form.seats}
                onChange={(e) => update("seats", Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as Cinema["status"])
              }
              className="w-full rounded-md border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
            >
              <option>Active</option>
              <option>Maintenance</option>
              <option>Closed</option>
            </select>
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
              {initialData ? "Save Changes" : "Add Cinema"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

function ManageCinemas() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCinemas = () => {
    fetch(`${API_URL}/admin/cinemas`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: Cinema[] = data.map((c: any) => ({
            id: String(c.cinema_id),
            name: c.cinema_name,
            location: c.cinema_location || "Phnom Penh",
            screens: c.halls?.length || 0,
            seats: (c.halls?.length || 0) * 80,
            status: (c.cinema_status as any) || "Active",
          }));
          setCinemas(mapped);
        }
      })
      .catch((err) => console.error("Failed to load cinemas:", err))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchCinemas();
  }, []);

  const editingCinema = cinemas.find((c) => c.id === editingId);

  const openAddModal = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cinema?")) return;
    try {
      await fetch(`${API_URL}/admin/cinemas/${id}`, { method: "DELETE" });
      setCinemas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete cinema:", err);
    }
  };

  const handleSubmit = async (data: CinemaFormData) => {
    try {
      if (editingId) {
        await fetch(`${API_URL}/admin/cinemas/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/admin/cinemas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      fetchCinemas();
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save cinema:", err);
    }
  };

  const columns: Column<Cinema>[] = [
    {
      key: "name",
      header: "Cinema",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "screens",
      header: "Screens",
      align: "center",
    },
    {
      key: "seats",
      header: "Total Seats",
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center gap-1 justify-center">
          <Armchair size={13} className="text-slate-400" />
          {row.seats.toLocaleString()}
        </span>
      ),
    },
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
            Manage Cinemas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {cinemas.length} locations across your network
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add Cinema
        </button>
      </div>

      <DataTable<Cinema>
        columns={columns}
        data={cinemas}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by name, location, status..."
        searchableKeys={["name", "location", "status"]}
        pageSize={6}
      />

      <CinemaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={
          editingCinema
            ? {
                name: editingCinema.name,
                location: editingCinema.location,
                screens: editingCinema.screens,
                seats: editingCinema.seats,
                status: editingCinema.status,
              }
            : undefined
        }
      />
    </div>
  );
}

export default ManageCinemas;
