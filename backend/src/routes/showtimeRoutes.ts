import { Router } from "express";
import { getShowtimesByMovie } from "../controllers/showtimeController";

const router = Router();

router.get("/", getShowtimesByMovie);

export default router;
