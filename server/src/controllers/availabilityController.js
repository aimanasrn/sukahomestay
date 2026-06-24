import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { checkAvailability } from "../services/availabilityService.js";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeBookings(bookings) {
  return bookings.map((booking) => ({
    ...booking,
    checkInDate: toDateKey(booking.checkInDate),
    checkOutDate: toDateKey(booking.checkOutDate),
  }));
}

function normalizeRules(rules) {
  return rules.map((rule) => ({
    ...rule,
    date: toDateKey(rule.date),
  }));
}

export async function getAvailability(req, res, next) {
  try {
    const { bookingType, checkInDate, checkOutDate, roomId } = req.query;

    if (!bookingType || !checkInDate || !checkOutDate) {
      throw new AppError(
        "bookingType, checkInDate, and checkOutDate are required",
        400
      );
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["pending", "booked"] },
      },
    });
    const availabilityRules = await prisma.availabilityRule.findMany();

    const result = checkAvailability({
      request: {
        bookingType,
        checkInDate,
        checkOutDate,
        roomId: roomId || null,
      },
      existingBookings: normalizeBookings(existingBookings),
      availabilityRules: normalizeRules(availabilityRules),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAvailabilityCalendar(req, res, next) {
  try {
    const { bookingType, roomId, startDate, endDate } = req.query;

    if (!bookingType || !startDate || !endDate) {
      throw new AppError("bookingType, startDate, and endDate are required", 400);
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["pending", "booked"] },
        checkInDate: {
          lt: new Date(endDate),
        },
        checkOutDate: {
          gt: new Date(startDate),
        },
      },
    });

    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lt: new Date(endDate),
        },
      },
    });

    const normalizedBookings = normalizeBookings(existingBookings);
    const normalizedRules = normalizeRules(availabilityRules);
    const blockedDates = [];
    const cursor = new Date(startDate);
    const end = new Date(endDate);

    while (cursor < end) {
      const currentDate = toDateKey(cursor);
      const nextDate = new Date(cursor);
      nextDate.setDate(nextDate.getDate() + 1);

      const result = checkAvailability({
        request: {
          bookingType,
          checkInDate: currentDate,
          checkOutDate: toDateKey(nextDate),
          roomId: roomId || null,
        },
        existingBookings: normalizedBookings,
        availabilityRules: normalizedRules,
      });

      if (!result.available) {
        blockedDates.push({
          date: currentDate,
          reason: result.reason,
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    res.json({ blockedDates });
  } catch (error) {
    next(error);
  }
}
