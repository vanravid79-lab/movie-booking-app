import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";

import "./index.css";
import Rootlayout from "./layout/root-layout.tsx";
import Tickets from "./page/Tickets.tsx";
import User from "./page/User.tsx";
import Notification from "./page/Notification.tsx";
import UpcomingMovie from "./component/upcoming.tsx";
import MovieDetail from "./component/movieDetail.tsx";
import SchedulePage from "./page/SchedulePage.tsx";
import LoginPage from "./page/LoginPage.tsx";
import SeatSelectionPage from "./page/SeatSelectionPage.tsx";
import CheckoutPage from "./page/CheckoutPage.tsx";

// Import Admin Layout & Components
import AdminLayout from "../src/admin/layout/AdminLayout.tsx";
import ManageSchedules from "./admin/pages/ManageSchedules.tsx";
import ProtectedRoute from "./component/ProtectedRoute.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public User Routes */}
        <Route element={<Rootlayout />}>
          <Route path="/" element={<App />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/user" element={<User />} />
          <Route path="/notification" element={<Notification />} />
          <Route
            path="/upcoming"
            element={
              <UpcomingMovie
                selectedMonth={new Date().toISOString().slice(0, 7)}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking/:scheduleId" element={<SeatSelectionPage />} />
          <Route path="/checkout/:scheduleId" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<SchedulePage />} />
        </Route>

        {/* Protected Admin Dashboard Route */}
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout
                title="Manage Schedules"
                createLabel="Add Schedule"
                onCreateClick={() => {
                  console.log("Create button clicked");
                }}
                onLogout={() => {
                  localStorage.removeItem("cambo_token");
                  localStorage.removeItem("cambo_user");
                  window.location.href = "/login";
                }}
                onNavigate={(key) => {
                  console.log("Navigated to:", key);
                }}
              >
                <ManageSchedules />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
