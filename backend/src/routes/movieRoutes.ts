import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { searchTMDBMovies } from "../services/tmdbService";

const router = express.Router();

const prisma = new PrismaClient();

router.get("/search", async (req: Request, res: Response) => {
  const query = String(req.query.query || "").trim();

  if (query.length < 2) {
    return res.status(400).json({
      ok: false,
      message: "Search query must contain at least 2 characters.",
    });
  }

  try {
    const data = await searchTMDBMovies(query);
    return res.json({ ok: true, ...data });
  } catch (error) {
    console.error("Failed to search TMDB movies:", error);
    return res.status(503).json({
      ok: false,
      message: "Movie search is temporarily unavailable.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET MOVIE SHOWTIMES
|--------------------------------------------------------------------------
| Example:
| GET /api/movies/550?date=2026-09-10
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Get TMDB movie ID
    const movieId = Number(req.params.id);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Invalid TMDB movie ID.",
      });
    }

    // Get selected date
    const date = String(req.query.date || "");

    if (!date) {
      return res.status(400).json({
        ok: false,
        message: "Date is required.",
      });
    }

    // Validate YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(date)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid date. Use YYYY-MM-DD.",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        ok: false,
        message: "Invalid calendar date.",
      });
    }

    // Start and end of selected day
    const startOfDay = parsedDate;

    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Get schedules
    const schedules = await prisma.schedule.findMany({
      where: {
        movie_id: movieId,

        schedule_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      include: {
        hall: {
          include: {
            cinema: true,
          },
        },
      },

      orderBy: {
        start_time: "asc",
      },
    });

    // Group schedules by cinema
    const cinemaMap = new Map<
      number,
      {
        cinemaId: number;
        cinemaName: string;
        cinemaLocation: string;
        sessions: {
          scheduleId: number;
          startTime: Date;
          endTime: Date;
          ticketPrice: number;
          hallName: string;
          hallType: string;
        }[];
      }
    >();

    // Build cinema groups
    for (const schedule of schedules) {
      const hall = schedule.hall;

      const cinema = hall.cinema;

      // Create cinema group
      if (!cinemaMap.has(cinema.cinema_id)) {
        cinemaMap.set(cinema.cinema_id, {
          cinemaId: cinema.cinema_id,
          cinemaName: cinema.cinema_name,
          cinemaLocation: cinema.cinema_location,
          sessions: [],
        });
      }

      // Add session
      cinemaMap.get(cinema.cinema_id)!.sessions.push({
        scheduleId: schedule.schedule_id,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        ticketPrice: Number(schedule.ticket_price),
        hallName: hall.hall_name,
        hallType: hall.hall_type,
      });
    }

    // Convert Map to array
    const showtimes = Array.from(cinemaMap.values());

    // Response
    return res.json({
      ok: true,
      movieId,
      date,
      count: schedules.length,
      showtimes,
    });
  } catch (error) {
    console.error("Failed to fetch movie showtimes:", error);

    return res.status(503).json({
      ok: false,
      message:
        "Movie showtimes are temporarily unavailable. Check the database connection.",
    });
  }
});

export default router;
