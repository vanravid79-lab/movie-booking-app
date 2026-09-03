import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMovieShowtimesByDate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // format: "YYYY-MM-DD"

    const movieIdNum = Number(id);

    // 1. Fetch schedules for this movie and specific date from PostgreSQL
    const schedules = await prisma.schedule.findMany({
      where: {
        movie_id: movieIdNum,
        ...(date
          ? {
              schedule_date: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
              },
            }
          : {}),
      },
      include: {
        hall: {
          include: {
            cinema: true,
          },
        },
      },
    });

    // 2. Group flat rows into the nested CinemaShowtime structure your frontend expects
    const cinemaMap = new Map();

    schedules.forEach((item) => {
      const cinema = item.hall?.cinema;
      if (!cinema) return;

      if (!cinemaMap.has(cinema.cinema_id)) {
        cinemaMap.set(cinema.cinema_id, {
          cinemaId: cinema.cinema_id,
          cinemaName: cinema.cinema_name,
          cinemaLocation: cinema.cinema_location || "Main Location",
          sessions: [],
        });
      }

      cinemaMap.get(cinema.cinema_id).sessions.push({
        scheduleId: item.schedule_id,
        startTime: item.start_time,
        endTime: item.end_time,
        ticketPrice: item.ticket_price,
        hallName: item.hall.hall_name,
        hallType: item.hall.hall_type || "Standard",
      });
    });

    res.json({ showtimes: Array.from(cinemaMap.values()) });
  } catch (error) {
    console.error("Error fetching movie showtimes:", error);
    res.status(500).json({ message: "Failed to fetch showtimes" });
  }
};
