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
import DashboardHome from "./admin/pages/DashboardHome.tsx";
import ManageMovies from "./admin/pages/ManageMovies.tsx";
import ManageCinemas from "./admin/pages/ManageCinemas.tsx";
import ManageSchedules from "./admin/pages/ManageSchedules.tsx";
import ManageBookings from "./admin/pages/ManageBookings.tsx";
import ManageScreens from "./admin/pages/ManageScreens.tsx";
import AdminSettings from "./admin/pages/AdminSettings.tsx";
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

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Box Office Overview">
                <DashboardHome />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Manage Movies" createLabel="Add Movie">
                <ManageMovies />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cinemas"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Manage Theatres" createLabel="Add Theatre">
                <ManageCinemas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Manage Schedules" createLabel="Add Schedule">
                <ManageSchedules />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/screens"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Screens & Seat Layouts">
                <ManageScreens />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="Customer Bookings">
                <ManageBookings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout title="System Settings">
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
