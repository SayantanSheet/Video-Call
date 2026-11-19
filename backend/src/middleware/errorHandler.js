import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Single place where errors become responses.
 *
 * The original handlers each did `res.json({message: \`Something went wrong ${e}\`})`,
 * which returned HTTP 200 on failure and interpolated the raw exception — leaking
 * Mongo internals and file paths to the client. Here, unexpected errors are logged
 * in full server-side and reported generically.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Duplicate key — the unique index on username raced two concurrent registrations.
  if (err?.code === 11000) {
    return res.status(409).json({ message: "That username is already taken" });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: "Invalid request data" });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  return res.status(500).json({ message: "Something went wrong on our end" });
};
