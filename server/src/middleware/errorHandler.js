export function errorHandler(error, _req, res, _next) {
  res.status(error.statusCode || 500).json({
    error: {
      message: error.message || "Internal server error",
      details: error.details || null,
    },
  });
}
