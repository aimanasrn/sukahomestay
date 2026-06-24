import { AppError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../lib/auth.js";

function getBearerToken(headerValue) {
  if (!headerValue?.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7);
}

export async function requireAdminAuth(req, _res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" ? new AppError("Invalid token", 401) : error);
  }
}
