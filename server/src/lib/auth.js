import jwt from "jsonwebtoken";
import { AppError } from "./errors.js";

const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  return secret;
}

export function signAdminToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
