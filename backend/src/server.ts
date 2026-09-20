import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import movieRoutes from "./routes/movieRoutes";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateJWT, AuthRequest } from "./middleware/auth";

dotenv.config();

const app = express();

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5059;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

// ======================================================
// POSTGRES POOL
// ======================================================

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ======================================================
// SSE CLIENTS
// ======================================================

let sseClients: express.Response[] = [];

// ======================================================
// POSTGRES REAL-TIME LISTENER
// ======================================================

async function setupDatabaseTriggers() {
  try {
    const client = await pgPool.connect();

    console.log("Connected to PostgreSQL.");

    // ==================================================
    // CREATE NOTIFICATION FUNCTION
    // ==================================================

    await client.query(`
      CREATE OR REPLACE FUNCTION notify_schedule_changes()
      RETURNS TRIGGER AS $$
      BEGIN

        PERFORM pg_notify(
          'schedule_channel',
          json_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'data',
            CASE
              WHEN TG_OP = 'DELETE'
                THEN row_to_json(OLD)
              ELSE
                row_to_json(NEW)
            END
          )::text
        );

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;

        RETURN NEW;

      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log("PostgreSQL notification function ready.");

    // ==================================================
    // REMOVE OLD TRIGGER
    // ==================================================

    await client.query(`
      DROP TRIGGER IF EXISTS schedule_changes_trigger
      ON schedule;
    `);

    // ==================================================
    // CREATE NEW TRIGGER
    // ==================================================

    await client.query(`
      CREATE TRIGGER schedule_changes_trigger

      AFTER INSERT OR UPDATE OR DELETE

      ON schedule

      FOR EACH ROW

      EXECUTE FUNCTION notify_schedule_changes();
    `);

    console.log("Schedule database trigger created.");

    // ==================================================
    // LISTEN
    // ==================================================

    await client.query(`
      LISTEN schedule_channel;
    `);

    console.log("Listening for PostgreSQL schedule changes...");

    // ==================================================
    // RECEIVE NOTIFICATION
    // ==================================================

    client.on("notification", (msg) => {
      if (!msg.payload) {
        return;
      }

      try {
        const payload = JSON.parse(msg.payload);

        console.log(
          `[Real-Time DB Event] ${payload.operation} on ${payload.table}`,
        );

        // ----------------------------------------------
        // Send update to all React clients
        // ----------------------------------------------

        sseClients.forEach((res) => {
          try {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
          } catch (error) {
            console.error("Failed to send SSE event:", error);
          }
        });
      } catch (error) {
        console.error("Invalid PostgreSQL notification:", error);
      }
    });

    console.log("PostgreSQL real-time listener active.");
  } catch (error) {
    console.error("Failed to setup real-time DB triggers:", error);
  }
}

// ======================================================
// AUTH API
// ======================================================

app.use("/api/auth", authRoutes);

// ======================================================
// MOVIE API
// ======================================================

app.use("/api/movies", movieRoutes);

// ======================================================
// ADMIN API
// ======================================================

app.use("/api/admin", adminRoutes);

// ======================================================
// BOOKING API
// ======================================================

app.post("/api/bookings", authenticateJWT, async (req: AuthRequest, res) => {
  const requestBody = (
    req as AuthRequest & {
      body: {
        scheduleId?: unknown;
        seatIds?: unknown[];
        foodItems?: unknown[];
        paymentMethod?: unknown;
      };
    }
  ).body;
  const scheduleId = Number(requestBody.scheduleId);
  const seatIds = Array.isArray(requestBody.seatIds)
    ? requestBody.seatIds.map(Number)
    : [];
  const paymentMethod =
    typeof requestBody.paymentMethod === "string"
      ? requestBody.paymentMethod
      : "Cash at cinema";
  const rawFoodItems = Array.isArray(requestBody.foodItems)
    ? requestBody.foodItems
    : [];

  if (
    !req.user?.sub ||
    !Number.isInteger(scheduleId) ||
    scheduleId <= 0 ||
    seatIds.length === 0 ||
    seatIds.some((seatId) => !Number.isInteger(seatId) || seatId <= 0)
  ) {
    return res.status(400).json({
      ok: false,
      message: "A valid schedule and at least one seat are required.",
    });
  }

  const uniqueSeatIds = [...new Set(seatIds)];

  try {
    const booking = await prisma.$transaction(
      async (transaction) => {
        const schedule = await transaction.schedule.findUnique({
          where: { schedule_id: scheduleId },
          include: { hall: true },
        });

        if (!schedule) {
          throw new Error("SHOWTIME_NOT_FOUND");
        }

        const seats = await transaction.seat.findMany({
          where: {
            seat_id: { in: uniqueSeatIds },
            hall_id: schedule.hall_id,
            seat_status: "Available",
          },
        });

        if (seats.length !== uniqueSeatIds.length) {
          throw new Error("SEAT_NOT_AVAILABLE");
        }

        const alreadyBooked = await transaction.bookingSeat.findMany({
          where: {
            seat_id: { in: uniqueSeatIds },
            booking: { schedule_id: scheduleId },
          },
          select: { seat_id: true },
        });

        if (alreadyBooked.length > 0) {
          throw new Error("SEAT_ALREADY_BOOKED");
        }

        const confirmedStatus = await transaction.bookingStatus.findUnique({
          where: { booking_status_name: "Confirmed" },
        });

        const parsedFoodItems = rawFoodItems.flatMap((item) => {
          if (!item || typeof item !== "object") {
            return [];
          }

          const candidate = item as {
            foodId?: unknown;
            name?: unknown;
            price?: unknown;
            quantity?: unknown;
          };

          const name =
            typeof candidate.name === "string" ? candidate.name.trim() : "";
          const price = Number(candidate.price);
          const quantity = Number(candidate.quantity);

          if (
            !name ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isFinite(quantity) ||
            quantity <= 0
          ) {
            return [];
          }

          return [
            {
              name,
              price,
              quantity,
            },
          ];
        });

        const foodEntries = [] as Array<{
          food_id: number;
          food_quantity: number;
          food_unit_price: Prisma.Decimal;
          food_subtotal: Prisma.Decimal;
        }>;

        let foodSubtotal = 0;

        for (const food of parsedFoodItems) {
          const normalizedName = food.name.trim();

          let foodRecord = await transaction.foodItem.findFirst({
            where: {
              food_name: {
                equals: normalizedName,
                mode: "insensitive",
              },
            },
          });

          if (!foodRecord) {
            let category = await transaction.foodCategory.findFirst({
              where: {
                food_category_name: "Cinema Snacks",
              },
            });

            if (!category) {
              category = await transaction.foodCategory.create({
                data: {
                  food_category_name: "Cinema Snacks",
                  food_category_description: "Movie snacks and drinks",
                },
              });
            }

            foodRecord = await transaction.foodItem.create({
              data: {
                food_name: normalizedName,
                food_price: new Prisma.Decimal(food.price.toFixed(2)),
                food_category_id: category.food_category_id,
                food_stock: food.quantity,
                food_status: "Available",
              },
            });
          }

          const unitPrice = Number(foodRecord.food_price || food.price);
          const subtotal = unitPrice * food.quantity;
          foodSubtotal += subtotal;

          foodEntries.push({
            food_id: foodRecord.food_id,
            food_quantity: food.quantity,
            food_unit_price: new Prisma.Decimal(unitPrice.toFixed(2)),
            food_subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          });
        }

        const totalAmount =
          Number(schedule.ticket_price) * seats.length + foodSubtotal;

        const booking = await transaction.booking.create({
          data: {
            user_id: req.user!.sub,
            schedule_id: scheduleId,
            total_amount: new Prisma.Decimal(totalAmount.toFixed(2)),
            booking_status_id: confirmedStatus?.booking_status_id,
            booking_seats: {
              create: seats.map((seat) => ({
                seat_id: seat.seat_id,
                seat_price: schedule.ticket_price,
              })),
            },
            booking_foods: foodEntries.length
              ? {
                  create: foodEntries.map((entry) => ({
                    food_id: entry.food_id,
                    food_quantity: entry.food_quantity,
                    food_unit_price: entry.food_unit_price,
                    food_subtotal: entry.food_subtotal,
                  })),
                }
              : undefined,
          },
          include: {
            booking_seats: { include: { seat: true } },
            booking_foods: { include: { food_item: true } },
          },
        });

        const methodRecord = await transaction.paymentMethod.upsert({
          where: { payment_method_name: paymentMethod },
          update: {},
          create: {
            payment_method_name: paymentMethod,
            payment_method_description: `Payment method selected by user: ${paymentMethod}`,
          },
        });

        const paymentStatus = await transaction.paymentStatus.upsert({
          where: { payment_status_name: "Pending" },
          update: {},
          create: {
            payment_status_name: "Pending",
            payment_status_description: "Payment is waiting to be processed.",
          },
        });

        await transaction.payment.create({
          data: {
            booking_id: booking.booking_id,
            payment_method_id: methodRecord.payment_method_id,
            payment_status_id: paymentStatus.payment_status_id,
            payment_amount: new Prisma.Decimal(totalAmount.toFixed(2)),
          },
        });

        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return res.status(201).json({
      ok: true,
      bookingId: booking.booking_id,
      totalAmount: Number(booking.total_amount),
      seats: booking.booking_seats.map(({ seat }) => seat.seat_number),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "SHOWTIME_NOT_FOUND") {
      return res
        .status(404)
        .json({ ok: false, message: "Showtime not found." });
    }
    if (message === "SEAT_NOT_AVAILABLE" || message === "SEAT_ALREADY_BOOKED") {
      return res.status(409).json({
        ok: false,
        message: "One or more selected seats are no longer available.",
      });
    }
    console.error("Failed to create booking:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to create booking." });
  }
});

// ======================================================
// SEAT SELECTION API
// ======================================================

app.get("/api/schedules/:scheduleId/seats", async (req, res) => {
  const scheduleId = Number(req.params.scheduleId);

  if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
    return res.status(400).json({ message: "Invalid schedule ID." });
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      include: {
        movie: true,
        hall: { include: { cinema: true } },
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Showtime not found." });
    }

    const seats = await prisma.seat.findMany({
      where: { hall_id: schedule.hall_id },
      orderBy: { seat_id: "asc" },
      include: {
        booking_seats: {
          where: { booking: { schedule_id: scheduleId } },
          select: { booking_seat_id: true },
        },
      },
    });

    return res.json({
      schedule: {
        schedule_id: schedule.schedule_id,
        movie_id: schedule.movie_id,
        movie_title: schedule.movie.movie_title,
        schedule_date: schedule.schedule_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        ticket_price: Number(schedule.ticket_price),
        hall_name: schedule.hall.hall_name,
        hall_type: schedule.hall.hall_type,
        cinema_name: schedule.hall.cinema.cinema_name,
      },
      seats: seats.map(({ booking_seats, ...seat }) => ({
        ...seat,
        is_booked: booking_seats.length > 0,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch seats:", error);
    return res.status(500).json({ message: "Failed to fetch seats." });
  }
});

// ======================================================
// REAL-TIME SCHEDULES - SSE
// ======================================================

app.get("/api/realtime/schedules", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  res.setHeader("Cache-Control", "no-cache");

  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  // ----------------------------------------------
  // Send connection message
  // ----------------------------------------------

  res.write(
    `data: ${JSON.stringify({
      type: "connected",
    })}\n\n`,
  );

  // ----------------------------------------------
  // Save client
  // ----------------------------------------------

  sseClients.push(res);

  console.log(`SSE client connected. Total: ${sseClients.length}`);

  // ----------------------------------------------
  // Remove disconnected client
  // ----------------------------------------------

  req.on("close", () => {
    sseClients = sseClients.filter((client) => client !== res);

    console.log(`SSE client disconnected. Total: ${sseClients.length}`);
  });
});

// ======================================================
// GET ALL SCHEDULES
// ======================================================

app.get("/api/schedules", async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
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

    res.json({
      ok: true,
      schedules,
    });
  } catch (error) {
    console.error("Failed to fetch schedules:", error);

    res.status(500).json({
      ok: false,
      message: "Failed to fetch schedules.",
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await setupDatabaseTriggers();
});
