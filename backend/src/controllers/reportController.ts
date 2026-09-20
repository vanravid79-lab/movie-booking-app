import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: any, res: any) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [revenueResult, ticketCount, totalBookings, cancelledBookings] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          payment_status: "Paid",
          payment_date: {
            gte: startOfDay,
          },
        },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: {
          booking_date: {
            gte: startOfDay,
          },
          status: "Confirmed",
        },
      }),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: "Cancelled" },
      }),
    ]);

    const summary = {
      dailyRevenue: Number(revenueResult._sum.amount ?? 0),
      ticketsSold: ticketCount,
      totalBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? ((totalBookings - cancelledBookings) / totalBookings) * 100 : 0,
    };

    return res.json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch dashboard summary" });
  }
};
