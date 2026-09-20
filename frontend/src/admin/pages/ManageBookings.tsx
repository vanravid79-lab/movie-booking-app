import { useEffect, useState } from "react";
import {
  Ticket,
  Search,
  Calendar,
  Clock,
  MapPin,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

interface AdminBooking {
  bookingId: number;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  movieTitle: string;
  cinemaName: string;
  hallName: string;
  seats: string;
  seatCount: number;
  scheduleDate: string;
  startTime: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  bookingDate: string;
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/bookings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch((err) => console.error("Failed to load bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cinemaName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      b.bookingStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const formatDate = (val: string) => {
    try {
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customer Bookings</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Total {bookings.length} reservations recorded in database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search bookings, customer, movie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-[#18181f] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-[#18181f] px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={fetchBookings}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#18181f] px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white transition hover:bg-zinc-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#18181f] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">No bookings match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-3.5">Ticket #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Location & Showtime</th>
                  <th className="px-6 py-3.5">Seats</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-rose-400">
                        {b.ticketNumber}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {formatDate(b.bookingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{b.customerName}</p>
                      <p className="text-xs text-zinc-400">{b.customerEmail}</p>
                      {b.customerPhone && (
                        <p className="text-[11px] text-zinc-500">{b.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-200">{b.movieTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      <p className="font-medium text-zinc-300">{b.cinemaName}</p>
                      <p className="text-zinc-500">{b.hallName}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {formatDate(b.scheduleDate)} • {b.startTime.slice(11, 16) || "10:30"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">
                        {b.seats} ({b.seatCount})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-medium text-zinc-300 capitalize">{b.paymentMethod}</p>
                      <span className="inline-block text-[10px] text-zinc-500 uppercase">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ${b.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 size={11} />
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
