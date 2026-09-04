import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  SUPABASE_URL: z.string().url().default("http://127.0.0.1:54321"),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default("local-publishable-key"),
  SUPABASE_SECRET_KEY: z.string().min(1).default("local-secret-key"),
  SUPABASE_DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@127.0.0.1:54322/postgres"),
  PENDING_APPROVAL_EXPIRY_HOURS: z.coerce.number().int().positive().default(2),
  AWAITING_PAYMENT_EXPIRY_HOURS: z.coerce.number().int().positive().default(24),
  ADMIN_WHATSAPP_NUMBER: z.string().regex(/^60\d{8,11}$/).default("60123456789"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("SUKA HOMESTAY <bookings@example.test>"),
});

export const env = schema.parse(process.env);
