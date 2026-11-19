# Apna Video Call

A full-stack MERN application for video conferencing and real-time chat. Uses **WebRTC**
for peer-to-peer media and **Socket.io** for signaling.

## 🚀 Features
- **Real-time video calling** — P2P audio and video, full mesh.
- **Screen sharing** — swapped in with `replaceTrack`, no reconnect.
- **In-call chat** — with unread badges and message history for late joiners.
- **Meeting rooms** — share a link; codes are generated with `crypto.getRandomValues`.
- **Meeting history** — per-account, behind JWT auth.
- **Responsive dark UI** — adapts from one participant to many, and to mobile.

## 🛠️ Tech Stack
- **Frontend**: React 19 (CRA), MUI v7, socket.io-client, axios.
- **Backend**: Node.js (ESM), Express, Socket.io, Mongoose, JWT, helmet.
- **Database**: MongoDB — users and meeting history.
- **Media**: WebRTC with STUN; TURN optional (see below).

---

## 📽️ How a call is established

1. **Lobby** — the app requests camera and microphone access once, degrading to
   audio-only or video-only if a device is unavailable, and lets you preview and
   set your name before joining.
2. **Join** — the client emits `join-call` with the room id and username; the
   server puts the socket in a Socket.io room and replies with the member list.
3. **Signaling** — each pair exchanges SDP offers/answers and ICE candidates over
   the `signal` event. Simultaneous offers are resolved with
   [perfect negotiation](https://w3c.github.io/webrtc-pc/#perfect-negotiation-example),
   so two peers offering at once doesn't wedge the connection.
4. **Streaming** — media flows directly between browsers. The server never sees it.
5. **Leaving** — the socket disconnects, the server broadcasts `user-left`, and
   each peer closes its connection and drops the tile.

> [!TIP]
> Technical detail lives in **[VIDEO_CALL_LOGIC.md](./VIDEO_CALL_LOGIC.md)**.

---

## ⚙️ Setup

### Prerequisites
- Node.js 18 or newer
- MongoDB (local or Atlas)

### 1. Clone
```bash
git clone https://github.com/SayantanSheet/Video-Call.git
cd Video-Call
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # then fill it in
npm run dev
```

`.env` values — see `backend/.env.example` for the full list:

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URL` | yes | MongoDB connection string |
| `JWT_SECRET` | in production | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGIN` | in production | Comma-separated allowlist, e.g. `https://your-frontend.onrender.com` |
| `PORT` | no | Defaults to 8000; Render injects this |
| `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL` | no | See *Connectivity* below |

> **Never commit `.env`.** It is gitignored. If a credential is ever committed,
> rotate it — removing the file in a later commit does not remove it from history.

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # defaults to http://localhost:8000
npm start
```

### 4. Verify
```bash
cd backend  && npm test   # API and auth smoke tests
cd frontend && npm test   # unit tests
curl localhost:8000/health
```

---

## 🌐 Connectivity and limits

- **TURN.** Only STUN is configured by default, which covers most home networks
  but fails behind symmetric NAT, mobile carrier CGNAT, and strict corporate
  firewalls. Set `TURN_*` in the backend `.env` to fix that — any provider works
  (coturn, Metered, Twilio, Cloudflare). The client fetches ICE config from
  `GET /api/v1/ice`, deliberately **not** from `REACT_APP_*`, because CRA inlines
  those into the public bundle where anyone could read the credentials.
- **Mesh size.** Every participant connects to every other, so each uplink
  encodes n−1 streams. Practical ceiling is roughly 4–6 on a desktop and fewer on
  a phone. Beyond that needs an SFU.
- **Secure context.** `getUserMedia` only works over HTTPS or on `localhost`.
  Testing from a phone against `http://192.168.x.x:3000` will always fail.
- **Single instance.** Room state is in-process. Running more than one backend
  instance requires the Socket.io Redis adapter, or participants on different
  instances won't see each other.

## 🤝 Contributing
Contributions are welcome — open an issue or a pull request.

## 📄 License
MIT.
