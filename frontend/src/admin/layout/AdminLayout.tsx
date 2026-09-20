import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../component/AdminSidebar";
import AdminHeader from "../component/AdminHeader";

interface AdminLayoutProps {
  /** Page content rendered in the main area. */
  children: ReactNode;
  /** Title shown in the header for the current page. */
  title?: string;
  /** Label for the header's primary action button. */
  createLabel?: string;
  /** Called when the header's primary action button is clicked. */
  onCreateClick?: () => void;
  /** Called when the sidebar logout button is clicked. */
  onLogout?: () => void;
  /** Called whenever the active sidebar nav item changes. */
  onNavigate?: (key: string) => void;
}

function AdminLayout({
  children,
  title = "Overview",
  createLabel,
  onCreateClick,
  onLogout,
  onNavigate,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    location.pathname === "/admin"
      ? "overview"
      : location.pathname === "/admin/movies"
        ? "movies"
        : location.pathname === "/admin/cinemas"
          ? "theatres"
          : location.pathname === "/admin/schedules"
            ? "showtimes"
            : location.pathname === "/admin/screens"
              ? "screens"
              : location.pathname === "/admin/bookings"
                ? "bookings"
                : location.pathname === "/admin/settings"
                  ? "settings"
                  : "overview";

  const handleNavigate = (key: string) => {
    onNavigate?.(key);
    if (key === "overview") navigate("/admin");
    else if (key === "movies") navigate("/admin/movies");
    else if (key === "showtimes") navigate("/admin/schedules");
    else if (key === "screens") navigate("/admin/screens");
    else if (key === "bookings") navigate("/admin/bookings");
    else if (key === "theatres") navigate("/admin/cinemas");
    else if (key === "settings") navigate("/admin/settings");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("cambo_token");
      localStorage.removeItem("cambo_user");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen bg-[#121217] text-slate-100">
      <AdminSidebar
        defaultActive={activeKey}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={title}
          createLabel={createLabel}
          onCreateClick={onCreateClick}
        />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
