import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import movieRoutes from "./routes/movieRoutes";
import adminRoutes from "./routes/adminRoutes";

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
// MOVIE API
// ======================================================

app.use("/api/movies", movieRoutes);

// ======================================================
// ADMIN API
// ======================================================

app.use("/api/admin", adminRoutes);

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
