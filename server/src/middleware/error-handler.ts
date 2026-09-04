import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }
  if (error instanceof ApiError) {
    res
      .status(error.statusCode)
      .json({
        success: false,
        message: error.message,
        code: error.code,
        ...(error.errors ? { errors: error.errors } : {}),
      });
    return;
  }
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error instanceof Error
        ? error.message
        : "Unknown error";
  res.status(500).json({ success: false, message });
};

export const notFound = ((_req, res) =>
  res
    .status(404)
    .json({
      success: false,
      message: "Route not found",
    })) satisfies import("express").RequestHandler;
