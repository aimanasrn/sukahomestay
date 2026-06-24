import { prisma } from "../lib/prisma.js";

export async function getAllProperties() {
  return prisma.property.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      rooms: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getHomestayProperty() {
  return prisma.property.findFirst({
    where: {
      type: "homestay",
      isActive: true,
    },
  });
}

export async function getRoomstayProperty() {
  return prisma.property.findFirst({
    where: {
      type: "roomstay",
      isActive: true,
    },
    include: {
      rooms: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });
}
