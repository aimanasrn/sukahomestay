import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBookingCreate, mockBookingFindMany } = vi.hoisted(() => ({
  mockBookingCreate: vi.fn(),
  mockBookingFindMany: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    booking: {
      create: mockBookingCreate,
      findMany: mockBookingFindMany,
    },
    availabilityRule: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    property: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import app from "../app.js";

describe("POST /api/bookings", () => {
  beforeEach(() => {
    mockBookingFindMany.mockResolvedValue([]);
    mockBookingCreate.mockResolvedValue({
      id: "booking-1",
      bookingType: "homestay",
      status: "pending",
    });
  });

  it("returns 201 for a valid booking payload", async () => {
    const response = await request(app).post("/api/bookings").send({
      bookingType: "homestay",
      checkInDate: "2026-07-10",
      checkOutDate: "2026-07-12",
      guestCount: 6,
      fullName: "Aina",
      phone: "60123456789",
      email: "aina@example.com",
    });

    expect(response.status).toBe(201);
    expect(response.body.booking.status).toBe("pending");
  });
});
