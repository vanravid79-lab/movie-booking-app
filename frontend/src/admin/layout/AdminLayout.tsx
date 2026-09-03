import React, { type ReactNode } from "react";
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
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar onLogout={onLogout} onNavigate={onNavigate} />

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
