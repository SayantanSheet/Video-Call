/**
 * An error that is safe to show the client. Anything thrown that is *not* an
 * ApiError is treated as unexpected by the error handler: logged in full,
 * reported to the client as a generic 500.
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.expected = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * handler instead of hanging the request. Without this, every handler needs its
 * own try/catch — which is how the original code ended up returning HTTP 200
 * with an error message in the body.
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
