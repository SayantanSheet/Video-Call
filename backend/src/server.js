import { createServer } from "node:http";
import mongoose from "mongoose";

import { config } from "./config/env.js";
import { createApp } from "./app.js";
import { connectToSocket } from "./controllers/socketManager.js";

const app = createApp();
const server = createServer(app);

connectToSocket(server);

/**
 * Retries with backoff instead of either crashing immediately or — as the most
 * recent change did — starting the server anyway. Listening without a database
 * made the process look healthy while every data route hung on Mongoose's
 * buffering timeout and then failed.
 */
const connectToDatabase = async (attempt = 1) => {
  const MAX_ATTEMPTS = 5;

  try {
    await mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: 10000 });
    console.log(`[db] connected to ${mongoose.connection.name}`);
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS) throw error;

    const delayMs = Math.min(1000 * 2 ** (attempt - 1), 10000);
    console.warn(
      `[db] connection attempt ${attempt}/${MAX_ATTEMPTS} failed (${error.message}); ` +
        `retrying in ${delayMs}ms`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectToDatabase(attempt + 1);
  }
};

const start = async () => {
  if (!config.mongoUrl) {
    console.error("MONGO_URL is not set. Copy backend/.env.example to backend/.env.");
    process.exit(1);
  }

  await connectToDatabase();

  // A drop *after* startup emits on the connection, not from connect().
  mongoose.connection.on("error", (error) => console.error("[db] error:", error.message));
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${config.port} is already in use.`);
      process.exit(1);
    }
    throw error;
  });

  server.listen(config.port, () => {
    console.log(`[server] listening on port ${config.port}`);
    console.log(`[server] allowed origins: ${config.corsOrigins.join(", ")}`);
  });
};

const shutdown = (signal) => {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
  // Don't hang forever on lingering sockets (WebSockets in particular).
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("[fatal] unhandled rejection:", reason);
  process.exit(1);
});

start().catch((error) => {
  console.error("[fatal] failed to start:", error.message);
  process.exit(1);
});
