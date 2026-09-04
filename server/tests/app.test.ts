import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
describe("API shell", () => {
  it("returns the versioned health response", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  it("rejects unauthenticated admin access", async () => {
    const response = await request(app).get("/api/v1/admin/dashboard");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
  it("allows only an administrator to verify a manual payment", async () => {
    const response = await request(app).post("/api/v1/admin/bookings/example/verify-payment");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
  it("does not expose the removed custom password endpoint", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "bad" });
    expect(response.status).toBe(404);
  });
});
