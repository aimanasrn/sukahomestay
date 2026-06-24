import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export async function getDashboardSummary() {
  const [properties, rooms, bookings, availabilityRules] = await Promise.all([
    prisma.property.count(),
    prisma.room.count(),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.availabilityRule.count(),
  ]);

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const bookedBookings = bookings.filter((booking) => booking.status === "booked").length;
  const monthlyRevenue = bookings
    .filter((booking) => booking.status === "booked")
    .reduce((sum, booking) => sum + Number(booking.guestCount || 0), 0);

  return {
    metrics: {
      properties,
      rooms,
      totalBookings: bookings.length,
      pendingBookings,
      bookedBookings,
      availabilityRules,
      monthlyRevenue,
    },
    recentBookings: bookings.slice(0, 6),
  };
}

export async function getAdminBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function updateBookingStatus(bookingId, { status, adminNote }) {
  if (!status) {
    throw new AppError("status is required", 400);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      adminNote: adminNote || null,
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminAvailabilityRules() {
  return prisma.availabilityRule.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "desc" }],
  });
}

export async function createAvailabilityRule(input) {
  const { date, bookingType, roomId, status } = input;

  if (!date || !bookingType || !status) {
    throw new AppError("date, bookingType, and status are required", 400);
  }

  return prisma.availabilityRule.create({
    data: {
      date: new Date(date),
      bookingType,
      roomId: roomId || null,
      status,
    },
  });
}

export async function deleteAvailabilityRule(ruleId) {
  await prisma.availabilityRule.delete({
    where: { id: ruleId },
  });

  return { success: true };
}

export async function getAdminProperties() {
  return prisma.property.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      rooms: {
        orderBy: { name: "asc" },
      },
    },
  });
}
