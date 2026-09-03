import express from "express";
import {
  getAdminCinemas,
  getAdminHalls,
  getAdminSchedules,
  createAdminSchedule,
  deleteAdminSchedule,
} from "../controllers/adminController";

const router = express.Router();

router.get("/cinemas", getAdminCinemas);
router.get("/cinemas/:cinemaId/halls", getAdminHalls);
router.get("/schedules", getAdminSchedules);
router.post("/schedules", createAdminSchedule);
router.delete("/schedules/:scheduleId", deleteAdminSchedule);

export default router;
