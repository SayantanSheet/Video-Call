import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import { config, iceServers } from "./config/env.js";
import userRoutes from "./routes/users.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

/**
 * Builds the Express app. Kept free of side effects — no listening, no database
 * connection — so tests can exercise it with supertest. Startup lives in
 * src/server.js.
 */
export const createApp = () => {
  const app = express();

  // Render and most PaaS front the app with a proxy; without this the rate
  // limiter buckets every client under the proxy's IP.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      // An explicit allowlist, replacing the previous bare `cors()` which sent
      // Access-Control-Allow-Origin: * for the whole API.
      origin: config.corsOrigins,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json({ limit: "40kb" }));
  app.use(express.urlencoded({ limit: "40kb", extended: true }));

  /** Reports real dependency state rather than just "the process is up". */
  app.get("/health", (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({
      status: dbReady ? "ok" : "degraded",
      database: dbReady ? "connected" : "disconnected",
      uptime: Math.round(process.uptime()),
    });
  });

  /**
   * ICE configuration is served from here rather than baked into the frontend:
   * CRA inlines every REACT_APP_* value into the public bundle, which would make
   * TURN credentials world-readable.
   */
  app.get("/api/v1/ice", (_req, res) => {
    res.json({ iceServers });
  });

  app.use("/api/v1/users", userRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
