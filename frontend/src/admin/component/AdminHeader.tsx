import React, { useState } from "react";
import { Search, Bell, ChevronDown, Plus } from "lucide-react";

interface AdminHeaderProps {
  /** Current section title, e.g. "Showtimes". */
  title?: string;
  /** Called when the primary action button is clicked. */
  onCreateClick?: () => void;
  /** Label for the primary action button. */
  createLabel?: string;
}

function AdminHeader({
  title = "Showtimes",
  onCreateClick = () => console.log("Create clicked"),
  createLabel = "New Showtime",
}: AdminHeaderProps) {
  const [query, setQuery] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 gap-4">
      {/* Title */}
      <h1 className="text-lg font-semibold text-slate-900 shrink-0">{title}</h1>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, bookings, screens..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onCreateClick}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          <span>{createLabel}</span>
        </button>

        <button
          type="button"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-600" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-slate-600">JD</span>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`text-slate-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/5 z-10">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">Jamie Diaz</p>
                <p className="text-xs text-slate-500">Theatre Manager</p>
              </div>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Account settings
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
