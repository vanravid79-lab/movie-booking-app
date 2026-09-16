import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TMDB_API_URL = "https://api.themoviedb.org/3";

interface TmdbMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  vote_average?: number;
}

function createTime(hours: number, minutes: number): Date {
  const date = new Date("1970-01-01T00:00:00.000Z");
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

async function fetchTmdbMovies(token: string): Promise<TmdbMovie[]> {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/movie/now_playing?language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    if (!response.ok) return [];
    const data: any = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
}

async function main() {
  console.log("=== Seeding exactly 6 cinemas for all movies ===");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      ticket, payment, booking_food, booking_seat, booking, 
      schedule, seat, movie_genre_map, movie_genre, movie, 
      hall, cinema, "user", schedule_status, booking_status 
    CASCADE;
  `);

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.createMany({
    data: [
      {
        user_name: "Admin",
        user_email: "admin@cinema.com",
        user_password: adminPassword,
        user_role: UserRole.Admin,
      },
      {
        user_name: "User",
        user_email: "user@cinema.com",
        user_password: userPassword,
        user_role: UserRole.User,
      },
    ],
  });

  const scheduledStatus = await prisma.scheduleStatus.create({
    data: {
      schedule_status_name: "Scheduled",
      schedule_status_description: "Showtime active.",
    },
  });

  await prisma.bookingStatus.createMany({
    data: [
      { booking_status_name: "Confirmed", booking_status_description: "Confirmed" },
      { booking_status_name: "Cancelled", booking_status_description: "Cancelled" },
      { booking_status_name: "Pending", booking_status_description: "Pending" },
    ],
  });

  // Seed 6 distinct cinema locations
  const c1 = await prisma.cinema.create({
    data: {
      cinema_name: "Major Cineplex - Aeon Mall 1",
      cinema_location: "Samdach Sothearos Blvd, Sangkat Tonle Bassac, Phnom Penh",
      cinema_phone: "023-981-888",
      halls: {
        create: [
          { hall_name: "Hall 1", hall_type: "IMAX 2D", hall_capacity: 180 },
          { hall_name: "Hall 2", hall_type: "Standard 2D", hall_capacity: 120 },
        ],
      },
    },
    include: { halls: true },
  });

  const c2 = await prisma.cinema.create({
    data: {
      cinema_name: "Major Cineplex - Aeon Mall 2 (Sen Sok)",
      cinema_location: "St. 1003, Pong Peay Village, Sangkat Phnom Penh Thmey",
      cinema_phone: "023-901-555",
      halls: {
        create: [
          { hall_name: "Screen 1", hall_type: "IMAX Laser", hall_capacity: 220 },
          { hall_name: "Screen 2", hall_type: "Dolby Atmos", hall_capacity: 150 },
        ],
      },
    },
    include: { halls: true },
  });

  const c3 = await prisma.cinema.create({
    data: {
      cinema_name: "Legend Cinema - Eden Garden",
      cinema_location: "Phnom Penh City Center, Sangkat Srah Chak, Khan Daun Penh",
      cinema_phone: "023-222-333",
      halls: {
        create: [
          { hall_name: "Screen A", hall_type: "Dolby Atmos", hall_capacity: 160 },
          { hall_name: "Screen B", hall_type: "Standard 2D", hall_capacity: 110 },
        ],
      },
    },
    include: { halls: true },
  });

  const c4 = await prisma.cinema.create({
    data: {
      cinema_name: "Legend Cinema - TK Avenue",
      cinema_location: "Corner of St. 315 & St. 516, Sangkat Boeung Kak 1, Toul Kork",
      cinema_phone: "023-888-222",
      halls: {
        create: [
          { hall_name: "Hall 1", hall_type: "Diamond VIP", hall_capacity: 80 },
          { hall_name: "Hall 2", hall_type: "Standard 2D", hall_capacity: 140 },
        ],
      },
    },
    include: { halls: true },
  });

  const c5 = await prisma.cinema.create({
    data: {
      cinema_name: "Legend Premium - Exchange Square",
      cinema_location: "St. 106, Sangkat Wat Phnom, Khan Daun Penh, Phnom Penh",
      cinema_phone: "023-999-444",
      halls: {
        create: [
          { hall_name: "Gold Class", hall_type: "VIP Recliner", hall_capacity: 60 },
          { hall_name: "Hall 2", hall_type: "Dolby 7.1", hall_capacity: 120 },
        ],
      },
    },
    include: { halls: true },
  });

  const c6 = await prisma.cinema.create({
    data: {
      cinema_name: "Prime Cineplex - Sovanna Mall",
      cinema_location: "St. 271, Sangkat Tomnoub Teuk, Khan Chamkarmon, Phnom Penh",
      cinema_phone: "023-777-111",
      halls: {
        create: [
          { hall_name: "Cinema 1", hall_type: "Standard 2D", hall_capacity: 130 },
          { hall_name: "Cinema 2", hall_type: "3D Digital", hall_capacity: 100 },
        ],
      },
    },
    include: { halls: true },
  });

  const allCinemas = [c1, c2, c3, c4, c5, c6];

  // Fetch TMDB movies
  const token = process.env.TMDB_API_KEY || "";
  const tmdbMovies = token ? await fetchTmdbMovies(token) : [];
  const movieMap = new Map<number, TmdbMovie>();
  tmdbMovies.forEach((m) => movieMap.set(m.id, m));

  const fallbackList = [
    { id: 1204680, title: "Ghostbusters: Frozen Empire" },
    { id: 1375646, title: "Dune: Part Two" },
    { id: 1368337, title: "Godzilla x Kong" },
    { id: 1101383, title: "Civil War" },
    { id: 1288445, title: "Furiosa: A Mad Max Saga" },
    { id: 1108427, title: "Kingdom of the Planet of the Apes" },
    { id: 969681,  title: "Bob Marley: One Love" },
    { id: 550,     title: "Fight Club" },
  ];

  fallbackList.forEach((d) => {
    if (!movieMap.has(d.id)) {
      movieMap.set(d.id, { id: d.id, title: d.title, overview: "Now showing in cinemas." });
    }
  });

  const targetMovies = Array.from(movieMap.values());

  for (const m of targetMovies) {
    await prisma.movie.upsert({
      where: { movie_id: m.id },
      update: {},
      create: {
        movie_id: m.id,
        movie_title: m.title,
        movie_description: m.overview || "Now showing in cinemas.",
        movie_duration: 120,
        movie_rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 7.5,
        movie_poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      },
    });
  }

  const timeSlots = [
    { start: createTime(10, 30), end: createTime(12, 45), price: 6.5 },
    { start: createTime(13, 15), end: createTime(15, 30), price: 7.5 },
    { start: createTime(16, 0),  end: createTime(18, 15), price: 9.0 },
    { start: createTime(19, 0),  end: createTime(21, 15), price: 10.5 },
    { start: createTime(21, 45), end: createTime(23, 50), price: 12.0 },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedulesData: any[] = [];
  const movieIds = targetMovies.map((m) => m.id);

  // Generate 30 days of showtimes
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + dayOffset);

    // Ensure every cinema has every movie
    for (const cinema of allCinemas) {
      for (const movieId of movieIds) {
        const hall = cinema.halls[(movieId + dayOffset) % cinema.halls.length];
        const slot1 = timeSlots[movieId % timeSlots.length];
        const slot2 = timeSlots[(movieId + 2) % timeSlots.length];

        schedulesData.push(
          {
            movie_id: movieId,
            hall_id: hall.hall_id,
            schedule_date: scheduleDate,
            start_time: slot1.start,
            end_time: slot1.end,
            ticket_price: slot1.price,
            schedule_status_id: scheduledStatus.schedule_status_id,
          },
          {
            movie_id: movieId,
            hall_id: hall.hall_id,
            schedule_date: scheduleDate,
            start_time: slot2.start,
            end_time: slot2.end,
            ticket_price: slot2.price,
            schedule_status_id: scheduledStatus.schedule_status_id,
          },
        );
      }
    }
  }

  const batchSize = 1000;
  for (let i = 0; i < schedulesData.length; i += batchSize) {
    const batch = schedulesData.slice(i, i + batchSize);
    await prisma.schedule.createMany({ data: batch });
  }

  console.log(`✅ Finished: ${allCinemas.length} Cinemas | ${targetMovies.length} Movies | ${schedulesData.length} Showtimes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());