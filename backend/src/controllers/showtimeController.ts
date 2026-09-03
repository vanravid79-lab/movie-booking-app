import { Request, Response } from "express";
import { prisma } from "../config/db";

export const getShowtimesByMovie = async (req: Request, res: Response) => {
  const { movieId, date } = req.query;

  if (!movieId || !date) {
    return res.status(400).json({ error: "movieId and date are required" });
  }

  try {
    const movieNum = Number(movieId);

    // Construct UTC start and end bounds for the given date string (YYYY-MM-DD)
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const schedules = await prisma.schedule.findMany({
      where: {
        movie_id: movieNum,
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

    const groupedCinemas = schedules.reduce((acc: any[], item) => {
      const cinema = item.hall.cinema;
      let existingCinema = acc.find((c) => c.cinemaId === cinema.cinema_id);

      if (!existingCinema) {
        existingCinema = {
          cinemaId: cinema.cinema_id,
          cinemaName: cinema.cinema_name,
          cinemaLocation: cinema.cinema_location,
          sessions: [],
        };
        acc.push(existingCinema);
      }

      existingCinema.sessions.push({
        scheduleId: item.schedule_id,
        startTime: item.start_time,
        ticketPrice: item.ticket_price,
        hallName: item.hall.hall_name,
        hallType: item.hall.hall_type,
      });

      return acc;
    }, []);

    return res.json(groupedCinemas);
  } catch (err) {
    console.error("Prisma query error:", err);
    return res.status(500).json({ error: "Failed to fetch showtimes" });
  }
};
