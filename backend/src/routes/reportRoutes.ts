import express from "express";
import { getDashboardSummary } from "../controllers/reportController";

const router = express.Router();

router.get("/summary", getDashboardSummary);

export default router;
