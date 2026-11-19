import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies a Bearer JWT and attaches the caller to req.user.
 *
 * This replaces the previous scheme, where handlers ran
 * `User.findOne({ token: req.query.token })` on an unvalidated client value.
 * That had two holes: `?token[$ne]=null` parsed into a Mongo operator and
 * matched the first user holding any token, and an *absent* token produced
 * `{token: undefined}`, which Mongoose strips to `{}` — matching the first
 * document in the collection. A signed token can't be coerced into either.
 */
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Session expired, please sign in again" : "Invalid token";
    return next(new ApiError(401, message));
  }
};

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
