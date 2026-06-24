import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { checkAvailability } from "./availabilityService.js";

function validateBookingInput(input) {
  const requiredFields = [
    "bookingType",
    "checkInDate",
    "checkOutDate",
    "guestCount",
    "fullName",
    "phone",
    "email",
  ];

  for (const field of requiredFields) {
    if (!input[field]) {
      throw new AppError(`${field} is required`, 400);
    }
  }

  if (input.bookingType === "roomstay" && !input.roomId) {
    throw new AppError("roomId is required for roomstay bookings", 400);
  }

  if (input.checkInDate >= input.checkOutDate) {
    throw new AppError("checkOutDate must be after checkInDate", 400);
  }
}

export async function createBooking(input) {
  validateBookingInput(input);

  const [existingBookings, availabilityRules] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["pending", "booked"] },
      },
    }),
    prisma.availabilityRule.findMany(),
  ]);

  const availability = checkAvailability({
    request: input,
    existingBookings: existingBookings.map((booking) => ({
      ...booking,
      checkInDate: booking.checkInDate.toISOString().slice(0, 10),
      checkOutDate: booking.checkOutDate.toISOString().slice(0, 10),
    })),
    availabilityRules: availabilityRules.map((rule) => ({
      ...rule,
      date: rule.date.toISOString().slice(0, 10),
    })),
  });

  if (!availability.available) {
    throw new AppError("Selected dates are unavailable", 409, availability);
  }

  return prisma.booking.create({
    data: {
      bookingType: input.bookingType,
      roomId: input.roomId || null,
      checkInDate: new Date(input.checkInDate),
      checkOutDate: new Date(input.checkOutDate),
      guestCount: Number(input.guestCount),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      specialRequest: input.specialRequest || null,
      status: "pending",
    },
  });
}
