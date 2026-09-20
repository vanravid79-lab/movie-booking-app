import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createSeatGrid = (hallCapacity: number) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatsPerRow = Math.max(6, Math.min(12, Math.ceil(hallCapacity / rows.length)));
  const result: Array<{ seat_code: string; seat_row: string; seat_number: number }> = [];

  rows.forEach((row) => {
    for (let number = 1; number <= seatsPerRow; number += 1) {
      result.push({
        seat_code: `${row}${number}`,
        seat_row: row,
        seat_number: number,
      });
    }
  });

  return result;
};

export const getSeatAvailability = async (req: any, res: any) => {
  try {
    const scheduleId = Number(req.query.scheduleId ?? req.params.scheduleId);

    if (Number.isNaN(scheduleId)) {
      return res.status(400).json({ error: "scheduleId is required" });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      include: { hall: true },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    let seats = await prisma.seat.findMany({
      where: { schedule_id: scheduleId },
      orderBy: [{ seat_row: "asc" }, { seat_number: "asc" }],
    });

    if (!seats.length) {
      const generatedSeats = createSeatGrid(schedule.hall.hall_capacity).map((seat) => ({
        schedule_id: scheduleId,
        seat_code: seat.seat_code,
        seat_row: seat.seat_row,
        seat_number: seat.seat_number,
        seat_status: "Available" as const,
      }));

      await prisma.seat.createMany({ data: generatedSeats });
      seats = await prisma.seat.findMany({
        where: { schedule_id: scheduleId },
        orderBy: [{ seat_row: "asc" }, { seat_number: "asc" }],
      });
    }

    return res.json({
      scheduleId,
      hallName: schedule.hall.hall_name,
      hallType: schedule.hall.hall_type,
      ticketPrice: Number(schedule.ticket_price),
      seats: seats.map((seat) => ({
        id: seat.seat_id,
        code: seat.seat_code,
        status: seat.seat_status,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch seat availability" });
  }
};

const generateBookingReference = () => `BK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

export const createBooking = async (req: any, res: any) => {
  try {
    const {
      scheduleId,
      selectedSeats,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      foodItems = [],
    } = req.body;

    if (!scheduleId || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ error: "scheduleId and selectedSeats are required" });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { schedule_id: Number(scheduleId) },
      include: { hall: true },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const existingBooked = await prisma.seat.findMany({
      where: {
        schedule_id: Number(scheduleId),
        seat_code: { in: selectedSeats },
        seat_status: { not: "Available" },
      },
    });

    if (existingBooked.length > 0) {
      return res.status(409).json({
        error: "One or more seats are no longer available",
        occupiedSeats: existingBooked.map((seat) => seat.seat_code),
      });
    }

    const foodList = await prisma.foodItem.findMany({
      where: {
        food_item_id: { in: foodItems.map((item: any) => Number(item.foodItemId)) },
      },
    });

    const foodTotal = foodItems.reduce((sum: number, item: any) => {
      const food = foodList.find((entry) => entry.food_item_id === Number(item.foodItemId));
      const unitPrice = food ? Number(food.price) : 0;
      return sum + unitPrice * Number(item.quantity || 1);
    }, 0);

    const ticketTotal = Number(schedule.ticket_price) * selectedSeats.length;
    const totalAmount = ticketTotal + foodTotal;

    let user = null;
    if (customerEmail || customerPhone) {
      user = await prisma.user.upsert({
        where: { email: customerEmail || "" },
        update: {
          full_name: customerName,
          phone: customerPhone || undefined,
        },
        create: {
          full_name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
          role: "Customer",
        },
      });
    }

    const bookingReference = generateBookingReference();

    const booking = await prisma.booking.create({
      data: {
        user_id: user?.user_id ?? null,
        schedule_id: Number(scheduleId),
        booking_reference: bookingReference,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        total_amount: totalAmount,
        status: "Confirmed",
      },
    });

    await prisma.seat.updateMany({
      where: {
        schedule_id: Number(scheduleId),
        seat_code: { in: selectedSeats },
      },
      data: {
        seat_status: "Booked",
        booking_id: booking.booking_id,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        booking_id: booking.booking_id,
        amount: totalAmount,
        payment_method: paymentMethod || "Cash",
        payment_status: "Paid",
        payment_ref: `PAY-${booking.booking_id}`,
      },
    });

    if (foodItems.length > 0) {
      const bookingFoodItems = foodItems.map((item: any) => {
        const food = foodList.find((entry) => entry.food_item_id === Number(item.foodItemId));
        return {
          booking_id: booking.booking_id,
          food_item_id: Number(item.foodItemId),
          quantity: Number(item.quantity || 1),
          unit_price: food ? food.price : 0,
        };
      });

      await prisma.bookingFoodItem.createMany({
        data: bookingFoodItems,
      });
    }

    return res.status(201).json({
      message: "Booking created successfully",
      booking: {
        ...booking,
        total_amount: Number(booking.total_amount),
        payment,
        seats: selectedSeats,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

export const getRecentBookings = async (req: any, res: any) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { booking_date: "desc" },
      take: 20,
      include: {
        schedule: { include: { hall: { include: { cinema: true } } } },
        payments: true,
        seats: true,
      },
    });

    return res.json(
      bookings.map((booking) => ({
        booking_id: booking.booking_id,
        booking_reference: booking.booking_reference,
        customer_name: booking.customer_name,
        total_amount: Number(booking.total_amount),
        status: booking.status,
        cinema: booking.schedule.hall.cinema.cinema_name,
        hall: booking.schedule.hall.hall_name,
        seats: booking.seats.map((seat) => seat.seat_code),
      })),
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};
