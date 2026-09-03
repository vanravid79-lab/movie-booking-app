import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/movies/:id?date=YYYY-MM-DD
router.get("/:id", async (req, res) => {
  try {
    const movieId = Number(req.params.id);
    const dateString = req.query.date as string; // Format: "YYYY-MM-DD"

    if (isNaN(movieId) || !dateString) {
      return res
        .status(400)
        .json({ message: "Invalid movie ID or date query." });
    }

    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

    const schedules = await prisma.schedule.findMany({
      where: {
        movie_id: movieId,
        schedule_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "Scheduled",
      },
      include: {
        hall: {
          include: {
            cinema: true,
          },
        },
      },
    });

    const cinemaMap = new Map<number, any>();

    schedules.forEach((sch) => {
      const cinema = sch.hall.cinema;

      if (!cinemaMap.has(cinema.cinema_id)) {
        cinemaMap.set(cinema.cinema_id, {
          cinemaId: cinema.cinema_id,
          cinemaName: cinema.cinema_name,
          cinemaLocation: cinema.cinema_location,
          sessions: [],
        });
      }

      cinemaMap.get(cinema.cinema_id).sessions.push({
        scheduleId: sch.schedule_id,
        startTime: sch.start_time,
        endTime: sch.end_time,
        ticketPrice: sch.ticket_price,
        hallName: sch.hall.hall_name,
        hallType: sch.hall.hall_type,
      });
    });

    const showtimes = Array.from(cinemaMap.values());

    return res.json({ showtimes });
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/schedules/all
router.get("/schedules/all", async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        hall: {
          include: {
            cinema: true,
          },
        },
      },
    });
    return res.json({ schedules });
  } catch (error) {
    console.error("Error fetching all schedules:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
