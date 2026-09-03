import React, { useState } from "react";
import {
  LayoutGrid,
  Clapperboard,
  Armchair,
  Ticket,
  Building2,
  CalendarDays,
  BadgePercent,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  key: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Box Office",
    items: [
      { label: "Overview", icon: LayoutGrid, key: "overview" },
      { label: "Movies", icon: Clapperboard, key: "movies" },
      { label: "Showtimes", icon: CalendarDays, key: "showtimes" },
      { label: "Screens & Seats", icon: Armchair, key: "screens" },
      { label: "Bookings", icon: Ticket, key: "bookings" },
      { label: "Theatres", icon: Building2, key: "theatres" },
      { label: "Offers", icon: BadgePercent, key: "offers" },
    ],
  },
  {
    label: "General",
    items: [
      { label: "Settings", icon: Settings, key: "settings" },
      { label: "Support", icon: LifeBuoy, key: "support" },
    ],
  },
];

interface AdminSidebarProps {
  /** Called when the logout button is clicked. */
  onLogout?: () => void;
  /** Key of the initially active nav item. */
  defaultActive?: string;
  /** Called whenever the active nav item changes. */
  onNavigate?: (key: string) => void;
}

function AdminSidebar({
  onLogout = () => console.log("Logout clicked"),
  defaultActive = "overview",
  onNavigate,
}: AdminSidebarProps) {
  const [active, setActive] = useState<string>(defaultActive);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleNavClick = (key: string) => {
    setActive(key);
    onNavigate?.(key);
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-md bg-rose-600 flex items-center justify-center shrink-0">
          <Ticket size={16} className="text-white" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <span className="ml-3 text-slate-900 font-semibold text-[15px]">
            CineDesk
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-slate-400">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, key }) => {
                const isActive = active === key;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(key)}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-rose-50 text-rose-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      title={collapsed ? label : undefined}
                    >
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.25 : 1.75}
                        className="shrink-0"
                      />
                      {!collapsed && <span>{label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / user + logout + collapse toggle */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-slate-600">JD</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Jamie Diaz
              </p>
              <p className="text-xs text-slate-500 truncate">Theatre Manager</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className="mt-3 w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="mt-1 w-full flex items-center justify-center gap-2 rounded-md py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          {collapsed ? (
            <ChevronsRight size={16} />
          ) : (
            <>
              <ChevronsLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
