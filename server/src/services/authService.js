import bcrypt from "bcryptjs";
import { AppError } from "../lib/errors.js";
import { signAdminToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function loginAdmin({ email, password }) {
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || user.role !== "admin") {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    token: signAdminToken(user),
    user: sanitizeUser(user),
  };
}

export async function getAdminProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "admin") {
    throw new AppError("Admin not found", 404);
  }

  return sanitizeUser(user);
}
