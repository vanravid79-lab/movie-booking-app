import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all cinemas
export const getAdminCinemas = async (req, res) => {
  try {
    const cinemas = await prisma.cinema.findMany({
      include: { halls: true },
    });
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get halls for a specific cinema
export const getAdminHalls = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const halls = await prisma.hall.findMany({
      where: { cinema_id: Number(cinemaId) },
    });
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all schedules with related hall and cinema info
export const getAdminSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        hall: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: { schedule_date: "desc" },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new schedule
export const createAdminSchedule = async (req, res) => {
  try {
    const {
      movie_id,
      hall_id,
      schedule_date,
      start_time,
      end_time,
      ticket_price,
      status,
    } = req.body;

    const newSchedule = await prisma.schedule.create({
      data: {
        movie_id: Number(movie_id),
        hall_id: Number(hall_id),
        schedule_date: new Date(schedule_date),
        start_time,
        end_time,
        ticket_price: parseFloat(ticket_price),
      },
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a schedule
export const deleteAdminSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    await prisma.schedule.delete({
      where: { schedule_id: Number(scheduleId) },
    });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
