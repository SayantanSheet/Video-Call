import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import server from "../environment";
import { fetchIceServers } from "../lib/iceConfig";

/**
 * Owns the socket connection and the full-mesh peer connections.
 *
 * Rewritten from the original signaling code, which had four structural bugs:
 *  - `user-joined` looped the full room list and unconditionally created a new
 *    RTCPeerConnection for every id, overwriting live connections. A third
 *    participant therefore destroyed the existing pair's connection, so calls
 *    with more than two people could never work.
 *  - Peer state lived in a module-level `var`, surviving remounts.
 *  - `user-left` dropped the video but never closed the connection.
 *  - Nothing was torn down on unmount, leaving ghost participants behind.
 */
export const useWebRTC = ({ enabled, roomId, username, localStream, outgoingVideoTrack }) => {
  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const mySocketIdRef = useRef(null);
  const localStreamRef = useRef(localStream);

  const [participants, setParticipants] = useState([]);
  const [connectionError, setConnectionError] = useState("");
  const [chatEvents, setChatEvents] = useState([]);

  localStreamRef.current = localStream;

  const updateParticipant = useCallback((socketId, patch) => {
    setParticipants((previous) => {
      const existing = previous.find((participant) => participant.socketId === socketId);
      if (!existing) {
        return [...previous, { socketId, stream: null, name: "Guest", ...patch }];
      }
      return previous.map((participant) =>
        participant.socketId === socketId ? { ...participant, ...patch } : participant
      );
    });
  }, []);

  /** Closes one peer and removes its tile. */
  const closePeer = useCallback((peerId) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;

    const { pc } = entry;
    // Detach handlers before closing so a final state change can't call
    // setState after unmount.
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onnegotiationneeded = null;
    pc.onconnectionstatechange = null;

    // Deliberately does NOT stop sender tracks: those are the *local* camera and
    // microphone tracks, shared by every peer connection. Stopping them here
    // killed the local camera for everyone still in the call as soon as one
    // participant left. Track lifetime belongs to useLocalMedia.
    pc.close();

    peersRef.current.delete(peerId);
    setParticipants((previous) => previous.filter((p) => p.socketId !== peerId));
  }, []);

  useEffect(() => {
    if (!enabled || !roomId) return undefined;

    let disposed = false;
    // The Map instance is stable for the hook's lifetime; capturing it keeps the
    // cleanup closure honest rather than reading the ref after teardown.
    const peers = peersRef.current;
    const socket = io(server, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const emitSignal = (toId, payload) => socket.emit("signal", toId, JSON.stringify(payload));

    /**
     * Idempotent: returns the existing connection if there is one. The original
     * code recreated connections here, which is what broke 3+ party calls.
     */
    const ensurePeer = (peerId, iceServers) => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers });

      const entry = {
        pc,
        // A total order over socket ids: for any pair, exactly one side is
        // polite. No extra signaling needed to agree who yields.
        polite: (mySocketIdRef.current ?? "") > peerId,
        makingOffer: false,
        ignoreOffer: false,
        isSettingRemoteAnswerPending: false,
        pendingCandidates: [],
        stream: new MediaStream(),
      };
      peersRef.current.set(peerId, entry);

      pc.onicecandidate = (event) => {
        if (event.candidate) emitSignal(peerId, { ice: event.candidate });
      };

      pc.ontrack = (event) => {
        // Audio and video arrive as separate events; keep one stable stream per
        // peer so srcObject isn't reassigned (which restarts playback).
        const stream = event.streams[0] ?? entry.stream;
        if (!event.streams[0]) stream.addTrack(event.track);

        // A peer toggling their camera or mic surfaces here as mute/unmute.
        //
        // Deliberately event-driven rather than reading track.muted now: a
        // remote track reports muted until its first frame arrives, so checking
        // eagerly flashes an avatar and a false "muted" badge on every join.
        const flagFor = (kind) => (kind === "video" ? "hasVideo" : "hasAudio");

        event.track.addEventListener("mute", () =>
          updateParticipant(peerId, { [flagFor(event.track.kind)]: false })
        );
        event.track.addEventListener("unmute", () =>
          updateParticipant(peerId, { [flagFor(event.track.kind)]: true })
        );

        updateParticipant(peerId, { stream, [flagFor(event.track.kind)]: true });
      };

      pc.onnegotiationneeded = async () => {
        try {
          entry.makingOffer = true;
          await pc.setLocalDescription();
          emitSignal(peerId, { sdp: pc.localDescription });
        } catch (error) {
          console.warn("[webrtc] negotiation failed", error);
        } finally {
          entry.makingOffer = false;
        }
      };

      pc.onconnectionstatechange = () => {
        updateParticipant(peerId, { connectionState: pc.connectionState });
        if (pc.connectionState === "failed") {
          pc.restartIce();
        }
      };

      // Attach local tracks. Passing the stream is what populates
      // event.streams[0] on the far side.
      const stream = localStreamRef.current;
      const hasVideo = Boolean(stream?.getVideoTracks().length);
      const hasAudio = Boolean(stream?.getAudioTracks().length);

      stream?.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Users without a camera or mic still need both m-lines negotiated, or
      // they can't receive the other side's media.
      if (!hasVideo) pc.addTransceiver("video", { direction: "recvonly" });
      if (!hasAudio) pc.addTransceiver("audio", { direction: "recvonly" });

      // The server relays signal payloads untouched, so names ride along here.
      emitSignal(peerId, { meta: { name: username } });

      return entry;
    };

    const flushCandidates = async (entry) => {
      const { pc, pendingCandidates } = entry;
      while (pendingCandidates.length) {
        const candidate = pendingCandidates.shift();
        try {
          await pc.addIceCandidate(candidate);
        } catch (error) {
          if (!entry.ignoreOffer) console.warn("[webrtc] bad ICE candidate", error);
        }
      }
    };

    const start = async () => {
      const iceServers = await fetchIceServers();
      if (disposed) return;

      socket.on("connect", () => {
        mySocketIdRef.current = socket.id;
        setConnectionError("");
        socket.emit("join-call", roomId, username);
      });

      socket.on("connect_error", () =>
        setConnectionError("Lost connection to the server. Retrying…")
      );

      socket.on("user-joined", (joinedId, memberIds) => {
        // Only ever *adds* connections for ids we don't already have.
        memberIds
          .filter((id) => id !== mySocketIdRef.current)
          .forEach((id) => ensurePeer(id, iceServers));

        if (joinedId !== mySocketIdRef.current) {
          updateParticipant(joinedId, {});
        }
      });

      socket.on("user-left", (leftId) => closePeer(leftId));

      socket.on("signal", async (fromId, rawMessage) => {
        if (fromId === mySocketIdRef.current) return;

        let message;
        try {
          message = typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
        } catch {
          return;
        }

        // ensurePeer rather than a bare lookup: a signal can legitimately arrive
        // before user-joined, which used to throw a TypeError.
        const entry = ensurePeer(fromId, iceServers);
        const { pc } = entry;

        if (message.meta?.name) {
          entry.name = message.meta.name;
          updateParticipant(fromId, { name: message.meta.name });
          return;
        }

        try {
          if (message.sdp) {
            const description = message.sdp;

            // Perfect negotiation: both sides may offer at once (guaranteed the
            // moment two people toggle screen share). The impolite peer wins.
            const readyForOffer =
              !entry.makingOffer &&
              (pc.signalingState === "stable" || entry.isSettingRemoteAnswerPending);
            const offerCollision = description.type === "offer" && !readyForOffer;

            entry.ignoreOffer = !entry.polite && offerCollision;
            if (entry.ignoreOffer) return;

            entry.isSettingRemoteAnswerPending = description.type === "answer";
            await pc.setRemoteDescription(description);
            entry.isSettingRemoteAnswerPending = false;

            await flushCandidates(entry);

            if (description.type === "offer") {
              await pc.setLocalDescription();
              emitSignal(fromId, { sdp: pc.localDescription });
            }
          } else if (message.ice) {
            // Candidates can outrun the description they belong to.
            if (!pc.remoteDescription) {
              entry.pendingCandidates.push(message.ice);
              return;
            }
            await pc.addIceCandidate(message.ice);
          }
        } catch (error) {
          if (!entry.ignoreOffer) console.warn("[webrtc] signal handling failed", error);
        }
      });

      socket.on("chat-message", (data, sender, senderSocketId) => {
        setChatEvents((previous) => [...previous, { data, sender, senderSocketId }]);
      });
    };

    start();

    return () => {
      disposed = true;
      peers.forEach((_, peerId) => closePeer(peerId));
      peers.clear();

      socket.removeAllListeners();
      socket.disconnect(); // the missing call that left ghost participants
      socketRef.current = null;
      mySocketIdRef.current = null;
      setParticipants([]);
    };
  }, [enabled, roomId, username, closePeer, updateParticipant]);

  /**
   * Swaps the outgoing video track on every peer when screen sharing starts or
   * stops. replaceTrack needs no renegotiation, which also avoids a whole class
   * of glare the original remove-add-and-reoffer approach created.
   */
  useEffect(() => {
    peersRef.current.forEach((entry) => {
      const sender = entry.pc.getSenders().find((candidate) => candidate.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(outgoingVideoTrack ?? null).catch(() => {});
      } else if (outgoingVideoTrack && localStreamRef.current) {
        entry.pc.addTrack(outgoingVideoTrack, localStreamRef.current);
      }
    });
  }, [outgoingVideoTrack]);

  const sendChatMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current) return false;

    socketRef.current.emit("chat-message", trimmed);
    return true;
  }, []);

  const leave = useCallback(() => {
    peersRef.current.forEach((_, peerId) => closePeer(peerId));
    peersRef.current.clear();
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, [closePeer]);

  return {
    participants,
    connectionError,
    chatEvents,
    mySocketId: mySocketIdRef.current,
    sendChatMessage,
    leave,
  };
};
