import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

/**
 * In production every secret must be supplied explicitly — falling back to a
 * generated value would silently invalidate every issued token on each restart.
 * In development we generate one so a fresh clone runs without setup, and warn
 * loudly because sessions will not survive a reload.
 */
const resolveJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (isProduction) {
    console.error(
      "JWT_SECRET is required in production. Generate one with:\n" +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
    process.exit(1);
  }

  console.warn(
    "[config] JWT_SECRET is not set — using a random development secret. " +
      "Tokens will be invalidated on every restart. See backend/.env.example."
  );
  return crypto.randomBytes(48).toString("hex");
};

/**
 * CORS_ORIGIN is a comma-separated allowlist. Falling back to "*" in production
 * is what the original code did and it is exactly what we are fixing, so an
 * unset value in production is a hard error instead.
 */
const resolveCorsOrigins = () => {
  const raw = process.env.CORS_ORIGIN?.trim();

  if (!raw) {
    if (isProduction) {
      console.error(
        "CORS_ORIGIN is required in production, e.g. https://your-frontend.onrender.com"
      );
      process.exit(1);
    }
    return ["http://localhost:3000"];
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

/** Optional TURN relay. Unset means STUN-only, which is fine on most home networks. */
const resolveTurnServers = () => {
  const { TURN_URL, TURN_USERNAME, TURN_CREDENTIAL } = process.env;
  if (!TURN_URL) return [];

  if (!TURN_USERNAME || !TURN_CREDENTIAL) {
    console.warn("[config] TURN_URL is set but credentials are missing — ignoring TURN.");
    return [];
  }

  return [
    {
      urls: TURN_URL.split(",").map((url) => url.trim()).filter(Boolean),
      username: TURN_USERNAME,
      credential: TURN_CREDENTIAL,
    },
  ];
};

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 8000,
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: resolveCorsOrigins(),
  stunServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
  turnServers: resolveTurnServers(),
};

/** ICE servers handed to the browser. TURN credentials never reach the client bundle. */
export const iceServers = [...config.stunServers, ...config.turnServers];
