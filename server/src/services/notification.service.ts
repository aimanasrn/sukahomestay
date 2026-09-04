import nodemailer from "nodemailer";
import { sql } from "../config/database.js";
import { env } from "../config/env.js";
import type { NotificationType } from "../types/domain.js";

type NotificationInput = {
  type: NotificationType;
  subject: string;
  content: string;
  email?: string;
  userId?: string;
  bookingId?: string;
};

export class NotificationService {
  async send(input: NotificationInput) {
    const rows = await sql<any[]>`insert into public.notifications (type, subject, content, channel, customer_id, booking_id) values (${input.type}, ${input.subject}, ${input.content}, ${input.email ? "email" : "in-app"}, ${input.userId ?? null}::uuid, ${input.bookingId ?? null}::uuid) returning *`;
    const record = rows[0];
    if (!input.email || !env.SMTP_HOST) {
      if (env.NODE_ENV === "development")
        console.info("Notification preview", {
          id: record.id,
          type: input.type,
          subject: input.subject,
        });
      return record;
    }
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          : undefined,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: input.email,
      subject: input.subject.replace(/[\r\n]/g, " "),
      text: input.content,
    });
    const updated = await sql<any[]>`update public.notifications set sent_at = now() where id = ${record.id} returning *`;
    return updated[0];
  }
}

export const notifications = new NotificationService();
