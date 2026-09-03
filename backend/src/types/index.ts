import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL pool for listening to native database changes from pgAdmin
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

// Store connected SSE clients to broadcast real-time changes
let sseClients: any[] = [];

async function setupDatabaseTriggers() {
  try {
    const client = await pgPool.connect();

    // Create the trigger function in PostgreSQL if it doesn't exist
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_schedule_changes() 
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify('schedule_channel', json_build_object(
          'operation', TG_OP,
          'table', TG_TABLE_NAME,
          'data', COALESCE(row_to_json(NEW), row_to_json(OLD))
        )::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Attach trigger to the Schedule table
    await client.query(`
      DROP TRIGGER IF EXISTS schedule_changes_trigger ON "Schedule";
      CREATE TRIGGER schedule_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "Schedule"
      FOR EACH ROW EXECUTE FUNCTION notify_schedule_changes();
    `);

    await client.query("LISTEN schedule_channel");

    client.on("notification", (msg) => {
      if (msg.payload) {
        const payload = JSON.parse(msg.payload);
        console.log(
          `[Real-Time DB Event] ${payload.operation} on ${payload.table} detected from pgAdmin!`,
        );

        // Broadcast the event to all active frontend SSE clients
        sseClients.forEach((res) => {
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        });
      }
    });

    console.log(
      "PostgreSQL real-time listener active. Changes in pgAdmin will broadcast automatically.",
    );
  } catch (err) {
    console.error("Failed to setup real-time DB triggers:", err);
  }
}

// Real-time endpoint for frontend clients (Server-Sent Events)
app.get("/api/realtime/schedules", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

// Standard API to fetch all schedules
app.get("/api/schedules", async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        hall: {
          include: { cinema: true },
        },
      },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await setupDatabaseTriggers();
});
