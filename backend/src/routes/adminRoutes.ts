import express from "express";
import {
  getAdminCinemas,
  getAdminHalls,
  getAdminSchedules,
  createAdminSchedule,
  deleteAdminSchedule,
  getDashboardStats,
  getAdminBookings,
  getAdminScreens,
  createAdminCinema,
  updateAdminCinema,
  deleteAdminCinema,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
} from "../controllers/adminController";

const router = express.Router();

// Dashboard stats
router.get("/dashboard-stats", getDashboardStats);

// Cinemas & Halls
router.get("/cinemas", getAdminCinemas);
router.post("/cinemas", createAdminCinema);
router.put("/cinemas/:cinemaId", updateAdminCinema);
router.delete("/cinemas/:cinemaId", deleteAdminCinema);
router.get("/cinemas/:cinemaId/halls", getAdminHalls);

// Schedules
router.get("/schedules", getAdminSchedules);
router.post("/schedules", createAdminSchedule);
router.delete("/schedules/:scheduleId", deleteAdminSchedule);

// Bookings
router.get("/bookings", getAdminBookings);

// Screens & Seats
router.get("/screens", getAdminScreens);

// Movies CRUD
router.post("/movies", createAdminMovie);
router.put("/movies/:movieId", updateAdminMovie);
router.delete("/movies/:movieId", deleteAdminMovie);

export default router;
