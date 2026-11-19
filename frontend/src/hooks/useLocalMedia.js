import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUDIO_CONSTRAINTS,
  SCREEN_CONSTRAINTS,
  VIDEO_CONSTRAINTS,
  describeMediaError,
  isMediaSupported,
  isScreenShareSupported,
} from "../lib/mediaConstraints";

/**
 * Owns the local camera/microphone stream and the screen capture.
 *
 * Replaces the original getPermissions(), which made three separate
 * getUserMedia calls and never stopped the first two streams — leaving the
 * camera light on — then read its own state in the same tick it set it.
 *
 * The toggles here flip `track.enabled` rather than re-acquiring hardware, and
 * every state value is read back off the track after mutating it, so the
 * control bar icons cannot disagree with what the hardware is actually doing.
 */
export const useLocalMedia = () => {
  const streamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const cancelledRef = useRef(false);

  const [localStream, setLocalStream] = useState(null);
  const [status, setStatus] = useState("pending"); // pending | ready | denied | unsupported
  const [mediaError, setMediaError] = useState("");
  const [devices, setDevices] = useState({ camera: false, microphone: false });
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const canShareScreen = useMemo(isScreenShareSupported, []);

  const syncFromTracks = useCallback(() => {
    const stream = streamRef.current;
    const videoTrack = stream?.getVideoTracks()[0];
    const audioTrack = stream?.getAudioTracks()[0];

    setDevices({ camera: Boolean(videoTrack), microphone: Boolean(audioTrack) });
    setVideoEnabled(Boolean(videoTrack?.enabled));
    setAudioEnabled(Boolean(audioTrack?.enabled));
  }, []);

  /** Acquire once on mount, degrading gracefully rather than failing outright. */
  useEffect(() => {
    cancelledRef.current = false;

    const acquire = async () => {
      if (!isMediaSupported()) {
        setStatus("unsupported");
        setMediaError(
          "Your browser can't access media here. Camera and microphone need HTTPS or localhost."
        );
        return;
      }

      // One combined request, then narrower fallbacks — not three unconditional
      // calls whose streams were then abandoned.
      const attempts = [
        { video: VIDEO_CONSTRAINTS, audio: AUDIO_CONSTRAINTS },
        { video: false, audio: AUDIO_CONSTRAINTS },
        { video: VIDEO_CONSTRAINTS, audio: false },
      ];

      let lastError = null;

      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          // The component may have unmounted during the await — StrictMode runs
          // this effect twice in development.
          if (cancelledRef.current) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          setLocalStream(stream);
          setStatus("ready");
          setMediaError(
            constraints.video && constraints.audio
              ? ""
              : "Joined with limited devices — some hardware wasn't available."
          );
          syncFromTracks();
          return;
        } catch (error) {
          lastError = error;
        }
      }

      if (cancelledRef.current) return;

      const { message } = describeMediaError(lastError);
      setStatus("denied");
      setMediaError(message);
      syncFromTracks();
    };

    acquire();

    return () => {
      cancelledRef.current = true;
    };
  }, [syncFromTracks]);

  /** Releases every track. Without this the camera light stayed on after leaving. */
  const stopAllMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    screenTrackRef.current?.stop();
    screenTrackRef.current = null;

    setLocalStream(null);
    setIsSharingScreen(false);
  }, []);

  useEffect(() => stopAllMedia, [stopAllMedia]);

  // Covers tab close and mobile backgrounding, which don't always unmount.
  useEffect(() => {
    const handler = () => stopAllMedia();
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [stopAllMedia]);

  const toggleVideo = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setVideoEnabled(track.enabled); // read back, don't assume
  }, []);

  const toggleAudio = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setAudioEnabled(track.enabled);
  }, []);

  const stopScreenShare = useCallback(() => {
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setIsSharingScreen(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!canShareScreen) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(SCREEN_CONSTRAINTS);
      const [track] = stream.getVideoTracks();
      if (!track) return;

      // Fires when the user stops sharing from the browser's own banner.
      track.addEventListener("ended", stopScreenShare);

      screenTrackRef.current = track;
      setIsSharingScreen(true);
    } catch {
      // The user dismissing the picker rejects the promise; not an error.
    }
  }, [canShareScreen, stopScreenShare]);

  const toggleScreenShare = useCallback(
    () => (isSharingScreen ? stopScreenShare() : startScreenShare()),
    [isSharingScreen, startScreenShare, stopScreenShare]
  );

  /**
   * What peers should receive: the screen when sharing, otherwise the camera.
   * useWebRTC watches this and calls replaceTrack, so no renegotiation is needed
   * to switch between them.
   */
  const outgoingVideoTrack = isSharingScreen
    ? screenTrackRef.current
    : (localStream?.getVideoTracks()[0] ?? null);

  return {
    localStream,
    status,
    mediaError,
    devices,
    videoEnabled,
    audioEnabled,
    isSharingScreen,
    canShareScreen,
    outgoingVideoTrack,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    stopAllMedia,
  };
};
