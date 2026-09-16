import { PrismaClient, ScheduleStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TMDB_API_URL = "https://api.themoviedb.org/3";

interface TmdbMovie {
  id: number;
  title: string;
}

interface TmdbResponse {
  results: TmdbMovie[];
}

/**
 * Fetches currently playing movie IDs from the TMDB API securely.
 */
async function fetchTmdbMovieIds(
  token: string,
  limit: number = 5,
): Promise<number[]> {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/movie/now_playing?language=en-US&page=1`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: TmdbResponse = await response.json();
    return data.results.slice(0, limit).map((movie) => movie.id);
  } catch (error) {
    console.warn(
      "⚠️ Failed to fetch from TMDB. Falling back to default movie IDs.",
      error,
    );
    return [550, 680, 13, 27205, 496243, 238];
  }
}

/**
 * Helper to construct Date objects for times cleanly without timezone drift.
 */
function createTime(hours: number, minutes: number): Date {
  const date = new Date("1970-01-01T00:00:00.000Z");
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log("==========================================");
  console.log(
    "🚀 Starting Professional Database Seeder (Phnom Penh Cinemas)...",
  );
  console.log("==========================================");

  // Clean existing database records safely in order
  console.log("🧹 Wiping existing database records...");
  await prisma.$transaction([
    prisma.schedule.deleteMany(),
    prisma.hall.deleteMany(),
    prisma.cinema.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("👤 Seeding default users (Admin & User)...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@cinema.com",
        password: adminPassword,
        role: Role.ADMIN,
      },
      {
        name: "User",
        email: "user@cinema.com",
        password: userPassword,
        role: Role.USER,
      },
    ],
  });

  console.log("🏢 Seeding expanded Phnom Penh cinemas and multiplex halls...");

  // 1. Aeon Mall Phnom Penh Cinema
  const aeon1Cinema = await prisma.cinema.create({
    data: {
      cinema_name: "Aeon Mall Cinema (Samdach Pan)",
      cinema_location: "Sangkat Tonle Bassac, Khan Chamkar Mon, Phnom Penh",
      cinema_phone: "023-981-888",
      cinema_status: "Active",
      halls: {
        create: [
          {
            hall_name: "Hall 1",
            hall_type: "IMAX 2D",
            hall_capacity: 180,
            hall_status: "Active",
          },
          {
            hall_name: "Hall 2",
            hall_type: "3D VIP",
            hall_capacity: 90,
            hall_status: "Active",
          },
          {
            hall_name: "Hall 3",
            hall_type: "Standard 2D",
            hall_capacity: 120,
            hall_status: "Active",
          },
        ],
      },
    },
    include: { halls: true },
  });

  // 2. Aeon Mall Sen Sok City Cinema
  const aeon2Cinema = await prisma.cinema.create({
    data: {
      cinema_name: "Aeon Mall Sen Sok City Cinema",
      cinema_location: "Sensok, Phnom Penh",
      cinema_phone: "023-901-222",
      cinema_status: "Active",
      halls: {
        create: [
          {
            hall_name: "Screen 1",
            hall_type: "IMAX Laser",
            hall_capacity: 220,
            hall_status: "Active",
          },
          {
            hall_name: "Screen 2",
            hall_type: "Dolby Atmos",
            hall_capacity: 150,
            hall_status: "Active",
          },
        ],
      },
    },
    include: { halls: true },
  });

  // 3. Legend Cinema Eden Garden
  const legendEden = await prisma.cinema.create({
    data: {
      cinema_name: "Legend Cinema Eden Garden",
      cinema_location: "Phnom Penh City Center (TK/BKK area)",
      cinema_phone: "023-222-333",
      cinema_status: "Active",
      halls: {
        create: [
          {
            hall_name: "Screen A",
            hall_type: "Dolby Atmos",
            hall_capacity: 200,
            hall_status: "Active",
          },
          {
            hall_name: "Screen B",
            hall_type: "Standard 2D",
            hall_capacity: 120,
            hall_status: "Active",
          },
        ],
      },
    },
    include: { halls: true },
  });

  // 4. Major Cineplex by Cellcard (AEON 1)
  const majorCineplex = await prisma.cinema.create({
    data: {
      cinema_name: "Major Cineplex Aeon Mall Phnom Penh",
      cinema_location: "Aeon Mall Phnom Penh, 1st Floor",
      cinema_phone: "023-999-555",
      cinema_status: "Active",
      halls: {
        create: [
          {
            hall_name: "Hall 4 (ScreenX)",
            hall_type: "ScreenX 270°",
            hall_capacity: 160,
            hall_status: "Active",
          },
          {
            hall_name: "Hall 5 (GLOE)",
            hall_type: "VIP Gold Class",
            hall_capacity: 60,
            hall_status: "Active",
          },
        ],
      },
    },
    include: { halls: true },
  });

  // 5. Prime Cineplex Sovanna
  const primeSovanna = await prisma.cinema.create({
    data: {
      cinema_name: "Prime Cineplex Sovanna",
      cinema_location: "Sovanna Shopping Center, Phnom Penh",
      cinema_phone: "023-888-123",
      cinema_status: "Active",
      halls: {
        create: [
          {
            hall_name: "Hall 1",
            hall_type: "Standard 2D",
            hall_capacity: 140,
            hall_status: "Active",
          },
          {
            hall_name: "Hall 2",
            hall_type: "3D Digital",
            hall_capacity: 100,
            hall_status: "Active",
          },
        ],
      },
    },
    include: { halls: true },
  });

  // Fetch dynamic movie IDs from TMDB
  const token = process.env.TMDB_API_KEY;
  const movieIds = token
    ? await fetchTmdbMovieIds(token, 6)
    : [550, 680, 13, 27205, 496243, 238];
  console.log(
    `🎬 Target Movie IDs mapped for scheduling: [${movieIds.join(", ")}]`,
  );

  console.log(
    "📅 Generating dynamic schedules across a 3-day window for all Phnom Penh locations...",
  );

  const allHalls = [
    ...aeon1Cinema.halls,
    ...aeon2Cinema.halls,
    ...legendEden.halls,
    ...majorCineplex.halls,
    ...primeSovanna.halls,
  ];

  const schedulesData = [];

  const timeSlots = [
    { start: createTime(11, 0), end: createTime(13, 30), price: 7.5 },
    { start: createTime(14, 0), end: createTime(16, 30), price: 8.5 },
    { start: createTime(17, 0), end: createTime(19, 30), price: 10.0 },
    { start: createTime(20, 0), end: createTime(22, 30), price: 12.5 },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate multi-day schedules distributed across all cinema halls and time slots
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + dayOffset);

    // Loop through all halls and assign rotating movie slots
    allHalls.forEach((hall, hallIndex) => {
      // Pick 2 different time slots per hall per day
      const slot1 = timeSlots[hallIndex % timeSlots.length];
      const slot2 = timeSlots[(hallIndex + 2) % timeSlots.length];

      const movie1Id = movieIds[hallIndex % movieIds.length];
      const movie2Id = movieIds[(hallIndex + 1) % movieIds.length];

      schedulesData.push(
        {
          movie_id: movie1Id,
          hall_id: hall.hall_id,
          schedule_date: scheduleDate,
          start_time: slot1.start,
          end_time: slot1.end,
          ticket_price: slot1.price,
          status: ScheduleStatus.Scheduled,
        },
        {
          movie_id: movie2Id,
          hall_id: hall.hall_id,
          schedule_date: scheduleDate,
          start_time: slot2.start,
          end_time: slot2.end,
          ticket_price: slot2.price,
          status: ScheduleStatus.Scheduled,
        },
      );
    });
  }

  const batchResult = await prisma.schedule.createMany({
    data: schedulesData,
    skipDuplicates: true,
  });

  const totalCinemas = 5;

  console.log("");
  console.log("==========================================");
  console.log("✅ Database Seeding Completed Successfully!");
  console.log("==========================================");
  console.log(`• Cinemas Seeded: ${totalCinemas}`);
  console.log(`• Total Halls Created: ${allHalls.length}`);
  console.log(`• Schedules Generated: ${batchResult.count}`);
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("❌ Critical Error during database seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
