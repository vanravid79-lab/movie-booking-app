import { PrismaClient, SeatStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Seeding Seats for all Halls ===");

  const halls = await prisma.hall.findMany();
  console.log(`Found ${halls.length} halls in database.`);

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 10;
  let totalSeatsAdded = 0;

  for (const hall of halls) {
    const seatsData: {
      hall_id: number;
      seat_number: string;
      seat_type: string;
      seat_status: SeatStatus;
    }[] = [];

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const rowLetter = rows[rIdx];
      const seatType = rIdx >= 5 ? "VIP" : "Standard";

      for (let num = 1; num <= seatsPerRow; num++) {
        seatsData.push({
          hall_id: hall.hall_id,
          seat_number: `${rowLetter}${num}`,
          seat_type: seatType,
          seat_status: SeatStatus.Available,
        });
      }
    }

    const result = await prisma.seat.createMany({
      data: seatsData,
      skipDuplicates: true,
    });

    totalSeatsAdded += result.count;
    console.log(
      `• Hall #${hall.hall_id} (${hall.hall_name}): seeded ${result.count} seats`,
    );
  }

  const finalSeatCount = await prisma.seat.count();
  console.log(`\n✅ Done! Total seats in database: ${finalSeatCount}`);
}

main()
  .catch((e) => {
    console.error("Error seeding seats:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
