# Video Call Implementation Logic

Technical explanation of how video calling works in **Apna Video Call**, using WebRTC
and Socket.io.

## Technology Stack
- **WebRTC** — peer-to-peer audio and video.
- **Socket.io** — signaling server coordinating connections between peers.
- **MediaDevices API** — camera, microphone, and screen capture.

## Where the code lives

| Concern | File |
|---|---|
| Page composition | `frontend/src/pages/VideoMeet.jsx` |
| Peer mesh + socket | `frontend/src/hooks/useWebRTC.js` |
| Camera, mic, screen | `frontend/src/hooks/useLocalMedia.js` |
| UI | `frontend/src/components/meet/` |
| Signaling server | `backend/src/controllers/socketManager.js` |

---

## Step-by-step workflow

### 1. Media acquisition and lobby

`useLocalMedia` makes a **single** `getUserMedia` call for camera and microphone. If it
fails, it falls back to audio-only, then video-only, and finally reports a reason
derived from the `DOMException` name — `NotAllowedError` (blocked), `NotFoundError`
(no device), `NotReadableError` (in use elsewhere). A user with no working camera can
still join and receive.

The stream is held in a ref and exposed as state. Each `<video>` element attaches it in
its own effect, so there is no shared ref pointing at two elements.

### 2. Connecting to the signaling server

On Join, `useWebRTC` opens the socket and emits `join-call` with the **room id from the
route** (`useParams().roomId`) and the username. Using the route param rather than
`window.location.href` means query strings and hash fragments can't fork a room.

Server-side, the socket joins a real Socket.io room. All listeners are registered once
per connection, at connection scope.

### 3. The WebRTC handshake

#### A. Discovery
The server emits `user-joined(socketId, memberIds, participants)` to the whole room.
Each client calls `ensurePeer` for every member it doesn't already have a connection
to. `ensurePeer` is **idempotent** — it returns the existing connection rather than
replacing it.

#### B. Perfect negotiation
In a full mesh, both peers can offer simultaneously. Rather than picking a "caller",
each pair derives politeness from a total order over socket ids:

```js
const polite = mySocketId > peerId;
```

For any pair exactly one side is polite, agreed without extra signaling.

- **Offering**: `onnegotiationneeded` → `setLocalDescription()` (implicit offer) →
  emit `{ sdp }`.
- **Receiving an offer during a collision**: the impolite peer ignores it; the polite
  peer rolls back implicitly inside `setRemoteDescription` and answers.
- **Answering**: `setRemoteDescription(offer)` → `setLocalDescription()` (implicit
  answer) → emit `{ sdp }`.

#### C. ICE candidates
Emitted as `{ ice }` over the same `signal` event. Candidates that arrive before the
remote description is set are **buffered** and flushed afterwards, rather than thrown
away.

#### D. Receive-only transceivers
A peer without a camera or microphone adds
`addTransceiver(kind, { direction: "recvonly" })` so both media sections are still
negotiated and they can receive the other side.

### 4. Receiving media

`ontrack` fires per track. Audio and video arrive as separate events, so each peer keeps
one stable `MediaStream` — reassigning `srcObject` would restart playback in Chrome.

Track `mute`/`unmute` events drive the avatar fallback and the mic-off badge. These are
handled as **events only**; reading `track.muted` on arrival would report muted before
the first frame and flash a false badge on every join.

### 5. Interaction

#### Mute / camera
Toggles `track.enabled`, then reads the value back off the track:

```js
track.enabled = !track.enabled;
setAudioEnabled(track.enabled);
```

No hardware re-acquisition, and the icon cannot disagree with the device.

#### Screen sharing
`getDisplayMedia()` produces a track that becomes the *outgoing* video track. A single
effect calls `RTCRtpSender.replaceTrack` on every peer. `replaceTrack` needs no
renegotiation, so sharing doesn't interrupt the call or create offer collisions. The
browser's own "Stop sharing" banner is handled via the track's `ended` event.

### 6. Disconnection and cleanup

On leave or unmount:
1. Each `RTCPeerConnection` has its handlers detached, then `close()`.
2. The socket is disconnected — this is what the server uses to broadcast `user-left`.
3. Local tracks are stopped by `useLocalMedia`, which also listens for `pagehide`.

Peer state lives in a `useRef`-held `Map`, so it is discarded with the component rather
than surviving a remount.

> **Note:** peer teardown deliberately does *not* stop sender tracks. Senders carry the
> shared local camera and microphone tracks; stopping them when one participant leaves
> would kill the local camera for everyone still in the call.

---

## Signaling event reference

| Event | Sender | Receiver | Payload |
| :--- | :--- | :--- | :--- |
| `join-call` | Client | Server | `(roomId, username)` |
| `user-joined` | Server | Room | `(socketId, memberIds, participants)` |
| `signal` | Client | Client (relayed) | `(targetId, JSON)` — `{sdp}`, `{ice}`, or `{meta}` |
| `chat-message` | Client → Server → Room | | `(text)` out, `(text, sender, senderSocketId)` back |
| `user-left` | Server | Room | `(socketId)` |

### Server-side guarantees

- `signal` is relayed only to a socket **in the sender's own room**.
- Chat sender names come from the socket, not the payload, so they can't be spoofed.
- Chat history is capped per room and deleted when the last participant leaves.
- Re-emitting `join-call` for the same room is a no-op, so listeners are never
  duplicated.
