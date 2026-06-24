import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin12345",
    10
  );

  await prisma.booking.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      fullName: "Sukahomestay Admin",
      email: process.env.ADMIN_EMAIL || "admin@sukahomestay.com",
      phone: "60123456789",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  await prisma.property.create({
    data: {
      name: "Sukahomestay",
      type: "homestay",
      description: "Family-friendly homestay for group stays.",
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 10,
      pricePerNight: 280,
      imageUrl:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const roomstay = await prisma.property.create({
    data: {
      name: "Roomstay Collection",
      type: "roomstay",
      description: "Three private roomstay units with attached bathrooms.",
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 160,
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    },
  });

  await prisma.property.create({
    data: {
      name: "Whole House Takeover",
      type: "whole_house",
      description: "Full-property private booking mode.",
      bedrooms: 7,
      bathrooms: 5,
      maxGuests: 16,
      pricePerNight: 520,
      imageUrl:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    },
  });

  await prisma.room.createMany({
    data: [
      {
        propertyId: roomstay.id,
        name: "Roomstay Room 1",
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNight: 120,
      },
      {
        propertyId: roomstay.id,
        name: "Roomstay Room 2",
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNight: 140,
      },
      {
        propertyId: roomstay.id,
        name: "Roomstay Room 3",
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 3,
        pricePerNight: 160,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
