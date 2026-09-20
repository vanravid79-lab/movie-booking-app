import { useState } from "react";
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
    ],
  },
  {
    label: "General",
    items: [
      { label: "Settings", icon: Settings, key: "settings" },
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
      className={`h-screen bg-[#18181f] border-r border-zinc-800 text-slate-200 flex flex-col transition-all duration-200 ${
        collapsed ? "w-19" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-md bg-rose-600 flex items-center justify-center shrink-0">
          <Ticket size={16} className="text-white" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <span className="ml-3 text-white font-semibold text-[15px]">
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
                          ? "bg-rose-600/20 text-rose-400 font-medium"
                          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
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
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-zinc-300">AD</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">
                Administrator
              </p>
              <p className="text-xs text-zinc-500 truncate">admin@cinema.com</p>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
          >
            <LogOut size={14} />
            {!collapsed && <span>Log out</span>}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight size={14} />
            ) : (
              <ChevronsLeft size={14} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
