import { Server } from "socket.io";
import { config } from "../config/env.js";

/** Chat is replayed to late joiners, so this is a privacy/memory bound, not a UI limit. */
const MAX_MESSAGES_PER_ROOM = 200;
const MAX_ROOM_ID_LENGTH = 256;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 48;

/** roomId -> [{ sender, data, "socket-id-sender", at }] */
const roomMessages = new Map();

const sanitize = (value, maxLength) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // Was origin "*" together with credentials: true — a combination browsers
      // reject outright — plus allowedHeaders: ["*"], which is not a valid
      // header-name list.
      origin: config.corsOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Every handler is registered once per connection. They used to be nested
    // inside the "join-call" handler, so a second join — a socket.io reconnect,
    // a React StrictMode double-mount, or a malicious loop — added another copy
    // of each, fanning every message out N times and running cleanup N times.
    let joinedRoom = null;

    socket.on("join-call", (path, username) => {
      const roomId = sanitize(path, MAX_ROOM_ID_LENGTH);
      if (!roomId) return;

      // Re-joining the same room is a no-op rather than a duplicate membership.
      if (joinedRoom === roomId) return;
      if (joinedRoom) socket.leave(joinedRoom);

      joinedRoom = roomId;
      socket.data.username = sanitize(username, MAX_NAME_LENGTH) || "Guest";
      socket.join(roomId);

      // Real socket.io rooms replace the hand-rolled `connections` map, which
      // required an O(rooms x members) scan on every single chat message.
      const members = [...(io.sockets.adapter.rooms.get(roomId) ?? [])];
      const participants = members.map((id) => ({
        socketId: id,
        username: io.sockets.sockets.get(id)?.data?.username ?? "Guest",
      }));

      io.to(roomId).emit("user-joined", socket.id, members, participants);

      // Replay recent chat to the joiner only.
      for (const message of roomMessages.get(roomId) ?? []) {
        socket.emit(
          "chat-message",
          message.data,
          message.sender,
          message["socket-id-sender"]
        );
      }
    });

    socket.on("signal", (toId, message) => {
      if (!joinedRoom || typeof toId !== "string") return;

      // Previously relayed to any socket id the client named, including sockets
      // in other rooms. Confine signaling to the sender's own room.
      const room = io.sockets.adapter.rooms.get(joinedRoom);
      if (!room?.has(toId)) return;

      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data) => {
      if (!joinedRoom) return;

      const text = sanitize(data, MAX_MESSAGE_LENGTH);
      if (!text) return;

      // The display name comes from the socket, not the payload — it used to be
      // client-supplied on every message and therefore freely spoofable.
      const sender = socket.data.username ?? "Guest";
      const entry = { sender, data: text, "socket-id-sender": socket.id, at: Date.now() };

      const history = roomMessages.get(joinedRoom) ?? [];
      history.push(entry);
      if (history.length > MAX_MESSAGES_PER_ROOM) history.shift();
      roomMessages.set(joinedRoom, history);

      // Message bodies are deliberately not logged; they were PII in the logs.
      io.to(joinedRoom).emit("chat-message", text, sender, socket.id);
    });

    socket.on("disconnect", () => {
      if (!joinedRoom) return;

      socket.leave(joinedRoom);
      io.to(joinedRoom).emit("user-left", socket.id);

      // Free room history once the last participant leaves. The original left
      // this line commented out, so every room's chat stayed in memory for the
      // life of the process and was replayed to anyone who later opened the
      // same URL.
      if (!io.sockets.adapter.rooms.get(joinedRoom)?.size) {
        roomMessages.delete(joinedRoom);
      }
      joinedRoom = null;
    });
  });

  return io;
};
