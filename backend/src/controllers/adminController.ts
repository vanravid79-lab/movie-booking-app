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

    // Check for overlapping schedules in the same hall on the same date
    const scheduleDateObj = new Date(schedule_date);
    const overlapping = await prisma.schedule.findFirst({
      where: {
        hall_id: Number(hall_id),
        schedule_date: scheduleDateObj,
        AND: [
          { start_time: { lt: end_time } },
          { end_time: { gt: start_time } },
        ],
      },
    });

    if (overlapping) {
      return res.status(409).json({
        error: "Schedule overlap detected: This hall already has a movie scheduled during this time slot.",
      });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        movie_id: Number(movie_id),
        hall_id: Number(hall_id),
        schedule_date: scheduleDateObj,
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

// ======================================================
// DASHBOARD STATS
// ======================================================

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRevenueAgg, todayRevenueAgg, ticketsCount, moviesCount, usersCount, recentBookings] =
      await Promise.all([
        prisma.booking.aggregate({
          _sum: { total_amount: true },
        }),
        prisma.booking.aggregate({
          where: { booking_date: { gte: today } },
          _sum: { total_amount: true },
        }),
        prisma.bookingSeat.count(),
        prisma.movie.count(),
        prisma.user.count({ where: { user_role: "User" } }),
        prisma.booking.findMany({
          take: 8,
          orderBy: { booking_date: "desc" },
          include: {
            user: true,
            schedule: {
              include: {
                movie: true,
                hall: { include: { cinema: true } },
              },
            },
            booking_seats: { include: { seat: true } },
            payments: { include: { payment_status: true } },
          },
        }),
      ]);

    const stats = {
      totalRevenue: Number(totalRevenueAgg._sum.total_amount || 0),
      todayRevenue: Number(todayRevenueAgg._sum.total_amount || 0),
      ticketsSold: ticketsCount,
      activeMovies: moviesCount,
      totalCustomers: usersCount,
      recentBookings: recentBookings.map((b) => ({
        id: `BK-${b.booking_id.toString().padStart(4, "0")}`,
        customer: b.user.user_name,
        email: b.user.user_email,
        movie: b.schedule.movie.movie_title,
        cinema: b.schedule.hall.cinema.cinema_name,
        hall: b.schedule.hall.hall_name,
        seats: b.booking_seats.map((s) => s.seat.seat_number),
        amount: Number(b.total_amount),
        status: b.payments[0]?.payment_status?.payment_status_name || "Confirmed",
        date: b.booking_date,
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// BOOKINGS MANAGEMENT
// ======================================================

export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { booking_date: "desc" },
      include: {
        user: true,
        schedule: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
        booking_seats: { include: { seat: true } },
        tickets: true,
        payments: {
          include: {
            payment_method: true,
            payment_status: true,
          },
        },
        booking_status: true,
      },
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.booking_id,
      ticketNumber: b.tickets[0]?.ticket_number || `TKT-${b.booking_id}`,
      customerName: b.user.user_name,
      customerEmail: b.user.user_email,
      customerPhone: b.user.user_phone,
      movieTitle: b.schedule.movie.movie_title,
      cinemaName: b.schedule.hall.cinema.cinema_name,
      hallName: b.schedule.hall.hall_name,
      seats: b.booking_seats.map((s) => s.seat.seat_number).join(", "),
      seatCount: b.booking_seats.length,
      scheduleDate: b.schedule.schedule_date,
      startTime: b.schedule.start_time,
      totalAmount: Number(b.total_amount),
      paymentMethod: b.payments[0]?.payment_method?.payment_method_name || "Cash",
      paymentStatus: b.payments[0]?.payment_status?.payment_status_name || "Pending",
      bookingStatus: b.booking_status?.booking_status_name || "Confirmed",
      bookingDate: b.booking_date,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get admin bookings error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// SCREENS & SEATS MANAGEMENT
// ======================================================

export const getAdminScreens = async (req, res) => {
  try {
    const halls = await prisma.hall.findMany({
      include: {
        cinema: true,
        seats: {
          orderBy: { seat_id: "asc" },
        },
        _count: {
          select: { schedules: true, seats: true },
        },
      },
      orderBy: { cinema_id: "asc" },
    });

    res.json(halls);
  } catch (error) {
    console.error("Get admin screens error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// CINEMAS CRUD
// ======================================================

export const createAdminCinema = async (req, res) => {
  try {
    const { name, location, phone } = req.body;
    const cinema = await prisma.cinema.create({
      data: {
        cinema_name: name,
        cinema_location: location,
        cinema_phone: phone || null,
        halls: {
          create: [
            { hall_name: "Hall 1", hall_type: "Standard 2D", hall_capacity: 80 },
            { hall_name: "Hall 2", hall_type: "VIP", hall_capacity: 80 },
          ],
        },
      },
      include: { halls: true },
    });

    // Seed seats for the new halls
    for (const hall of cinema.halls) {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seatsData = [];
      for (let r = 0; r < rows.length; r++) {
        for (let num = 1; num <= 10; num++) {
          seatsData.push({
            hall_id: hall.hall_id,
            seat_number: `${rows[r]}${num}`,
            seat_type: r >= 5 ? "VIP" : "Standard",
            seat_status: "Available",
          });
        }
      }
      await prisma.seat.createMany({ data: seatsData });
    }

    res.status(201).json(cinema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdminCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const { name, location, phone } = req.body;
    const updated = await prisma.cinema.update({
      where: { cinema_id: Number(cinemaId) },
      data: {
        cinema_name: name,
        cinema_location: location,
        cinema_phone: phone || null,
      },
      include: { halls: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdminCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    await prisma.cinema.delete({
      where: { cinema_id: Number(cinemaId) },
    });
    res.json({ message: "Cinema deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
// MOVIES CRUD
// ======================================================

export const createAdminMovie = async (req, res) => {
  try {
    const { title, description, duration, rating, poster, language } = req.body;
    const movie = await prisma.movie.create({
      data: {
        movie_title: title,
        movie_description: description || "Now showing in cinemas.",
        movie_duration: Number(duration) || 120,
        movie_rating: rating ? parseFloat(rating) : 7.5,
        movie_poster: poster || null,
        movie_language: language || "English",
        movie_status: "NowShowing",
      },
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdminMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { title, description, duration, rating, poster, language } = req.body;
    const updated = await prisma.movie.update({
      where: { movie_id: Number(movieId) },
      data: {
        movie_title: title,
        movie_description: description,
        movie_duration: duration ? Number(duration) : undefined,
        movie_rating: rating ? parseFloat(rating) : undefined,
        movie_poster: poster,
        movie_language: language,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdminMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    await prisma.movie.delete({
      where: { movie_id: Number(movieId) },
    });
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
