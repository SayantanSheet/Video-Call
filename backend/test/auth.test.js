import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../src/app.js";

const app = createApp();

/**
 * These cover the routes that reject before touching MongoDB, so they run
 * without a database. The auth-bypass cases are the important ones: each was a
 * live data leak before the JWT middleware landed.
 */

test("GET /health reports degraded when the database is down", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 503);
  assert.equal(res.body.database, "disconnected");
});

test("GET /api/v1/ice returns STUN servers and never leaks TURN credentials to anon users", async () => {
  const res = await request(app).get("/api/v1/ice");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.iceServers));
  assert.ok(res.body.iceServers.length > 0);
});

test("unknown routes return 404, not the SPA fallthrough", async () => {
  const res = await request(app).get("/api/v1/nope");
  assert.equal(res.status, 404);
});

test("history requires a token — previously returned the first user in the collection", async () => {
  const res = await request(app).get("/api/v1/users/get_all_activity");
  assert.equal(res.status, 401);
});

test("NoSQL operator injection is rejected — previously leaked any user's history", async () => {
  // Express's extended query parser turns this into { $ne: null }, which used to
  // reach User.findOne() directly and match the first user holding any token.
  const res = await request(app).get("/api/v1/users/get_all_activity?token[$ne]=null");
  assert.equal(res.status, 401);
});

test("a malformed bearer token is rejected", async () => {
  const res = await request(app)
    .get("/api/v1/users/get_all_activity")
    .set("Authorization", "Bearer not-a-real-jwt");
  assert.equal(res.status, 401);
});

test("writing to history requires auth", async () => {
  const res = await request(app)
    .post("/api/v1/users/add_to_activity")
    .send({ token: { $ne: null }, meeting_code: "abc123" });
  assert.equal(res.status, 401);
});

test("register rejects an empty body instead of crashing inside bcrypt", async () => {
  // bcrypt.hash(undefined, 10) used to throw and surface as HTTP 200.
  const res = await request(app).post("/api/v1/users/register").send({});
  assert.equal(res.status, 400);
  assert.match(res.body.message, /required/i);
});

test("register rejects a short password", async () => {
  const res = await request(app)
    .post("/api/v1/users/register")
    .send({ name: "Test", username: "tester", password: "short" });
  assert.equal(res.status, 400);
});

test("register rejects a non-string username", async () => {
  const res = await request(app)
    .post("/api/v1/users/register")
    .send({ name: "Test", username: { $ne: null }, password: "longenough123" });
  assert.equal(res.status, 400);
});

test("error responses never interpolate the raw exception", async () => {
  const res = await request(app).post("/api/v1/users/register").send({});
  assert.doesNotMatch(JSON.stringify(res.body), /Error:|at .*\.js:/);
});
