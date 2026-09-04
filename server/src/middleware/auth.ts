import type { RequestHandler } from "express";
import { supabasePublic } from "../config/supabase.js";
import { sql } from "../config/database.js";
import { ApiError } from "../utils/api-error.js";
import type { UserRole } from "../types/domain.js";

async function authenticate(header: string | undefined) {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match) return undefined;
  const { data, error } = await supabasePublic.auth.getUser(match[1]);
  if (error || !data.user) return undefined;
  const rows = await sql<{ role: UserRole }[]>`select role from public.profiles where id = ${data.user.id} limit 1`;
  return rows[0] ? { userId: data.user.id, role: rows[0].role } : undefined;
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const principal = await authenticate(req.headers.authorization);
    if (!principal) return next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));
    req.auth = principal;
    next();
  } catch (error) { next(error); }
};

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try { const principal = await authenticate(req.headers.authorization); if (principal) req.auth = principal; next(); }
  catch { next(); }
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role))
      return next(
        new ApiError(
          403,
          "You do not have permission to perform this action",
          "FORBIDDEN",
        ),
      );
    next();
  };
