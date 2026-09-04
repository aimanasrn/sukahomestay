export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "REQUEST_ERROR",
    public readonly errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
  }
}
