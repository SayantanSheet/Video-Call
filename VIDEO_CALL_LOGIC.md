# Video Call Implementation Logic

This document provides a technical explanation of how the video call functionality is implemented in the **ApnaVideoCall** project using WebRTC and Socket.io.

## Technology Stack
- **WebRTC**: Used for Peer-to-Peer (P2P) audio and video streaming.
- **Socket.io**: Acts as the signaling server to coordinate connections between peers.
- **MediaDevices API**: Used to capture camera and microphone streams.

---

## Step-by-Step Workflow

### 1. Media Acquisition & Lobby
Before joining a call, the application prepares the user's environment:
- **Permissions**: Calls `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`.
- **Local Stream**: Stores the resulting `MediaStream` in `window.localStream`.
- **Local Preview**: Attaches the stream to a muted `<video>` element so the user can see themselves.

### 2. Signaling Server Connection
When the user clicks "Connect":
- **Socket Initialization**: The client connects to the server (`io.connect(server_url)`).
- **Joining a Room**: Emits a `join-call` event with the current URL as the `roomID`.
- **Server-Side**: The `socketManager.js` in the backend adds the user's socket ID to a list associated with that `roomID`.

### 3. The WebRTC Handshake (Signaling)
Direct P2P connections cannot be established without an initial "handshake" mediated by the server.

#### A. User Discovery
When a new user joins, the server emits `user-joined` to everyone already in the room with the new user's socket ID.

#### B. The SDP Offer
Existing participants:
1. Create a new `RTCPeerConnection` for the newcomer.
2. Add their `localStream` to this connection.
3. Call `peerConnection.createOffer()` to generate a Session Description (SDP).
4. Set it as `LocalDescription`.
5. Send this offer to the newcomer via the socket `signal` event.

#### C. The SDP Answer
The newcomer:
1. Receives the `signal` containing the offer.
2. Creates an `RTCPeerConnection` for the sender.
3. Sets the received offer as `RemoteDescription`.
4. Calls `peerConnection.createAnswer()`.
5. Sets it as `LocalDescription`.
6. Sends the answer back to the sender via the socket `signal` event.

#### D. ICE Candidates (The Network Path)
As soon as the peer connections are created:
1. Both browsers start gathering **ICE Candidates** (IPs and Ports) using STUN servers.
2. Each time a candidate is found, it's sent via the `signal` event.
3. The receiving end adds the candidate using `peerConnection.addIceCandidate()`.

### 4. Establishing the Stream
Once the handshake is complete:
- The `onaddstream` event (or `ontrack`) fires on the `RTCPeerConnection`.
- The remote `MediaStream` is extracted and added to the application state (`videos` array).
- React renders a new `<video>` component for each remote stream.

### 5. Interaction Features

#### Mute/Unmute
- Controlled by toggling the `enabled` property of the tracks in `window.localStream`.
- `localStream.getAudioTracks()[0].enabled = !audioEnabled;`

#### Screen Sharing
- Calls `navigator.mediaDevices.getDisplayMedia()`.
- Replaces the video track in all active `RTCPeerConnection` instances with the screen track.
- Triggers a renegotiation (new offer/answer) if necessary.

### 6. Disconnection & Cleanup
When a user leaves:
1. **Track Termination**: All media tracks are stopped (`track.stop()`).
2. **Socket Disconnect**: The socket connection is closed.
3. **Broadcasting Exit**: The server detects the disconnect and emits `user-left` to the room.
4. **Cleanup**: Other clients remove the leaving user's socket ID from their `connections` object and update the UI.

---

## Signaling Event Reference

| Event Name | Sender | Receiver | Description |
| :--- | :--- | :--- | :--- |
| `join-call` | Client | Server | Tells server to add user to a specific room. |
| `user-joined`| Server | Room Clients | Notifies existing users about a new participant. |
| `signal` | Client | Client (via Server) | Relays SDP Offers/Answers and ICE Candidates. |
| `chat-message`| Client | Room Clients | Broadcasts text messages to the meeting. |
| `user-left` | Server | Room Clients | Notifies others that a user has disconnected. |
