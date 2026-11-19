import { ApiError } from "./ApiError.js";

/**
 * Guards against two distinct problems:
 *  - missing input reaching bcrypt (`bcrypt.hash(undefined, 10)` threw and, under
 *    the old catch blocks, surfaced as a 200 response)
 *  - non-string input, which is how `{"$ne": null}` used to reach a Mongo filter
 */
export const requireString = (value, field, { min = 1, max = 128 } = {}) => {
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} is required`);
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    throw new ApiError(
      400,
      min === 1 ? `${field} is required` : `${field} must be at least ${min} characters`
    );
  }

  if (trimmed.length > max) {
    throw new ApiError(400, `${field} must be at most ${max} characters`);
  }

  return trimmed;
};

/**
 * Usernames are stored lowercase so `Bob` and `bob` collide on the unique index
 * rather than becoming two accounts that look identical in the UI.
 */
export const normalizeUsername = (value) =>
  requireString(value, "Username", { min: 3, max: 32 }).toLowerCase();

/**
 * bcrypt silently truncates at 72 bytes, so anything longer gives a false sense
 * of strength. Reject it instead of quietly ignoring the tail.
 */
export const validatePassword = (value) =>
  requireString(value, "Password", { min: 8, max: 72 });
