import express from "express";
import { createBooking, getRecentBookings, getSeatAvailability } from "../controllers/bookingController";

const router = express.Router();

router.get("/availability", getSeatAvailability);
router.post("/", createBooking);
router.get("/recent", getRecentBookings);

export default router;
