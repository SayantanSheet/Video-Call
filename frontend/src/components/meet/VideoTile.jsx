import { useEffect, useRef } from "react";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";

import styles from "../../styles/videoComponent.module.css";

const initialsOf = (name) =>
  (name || "Guest")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * One participant. Attaches the stream in an effect rather than relying on a
 * shared ref — the original code pointed a single `localVideoRef` at two
 * different <video> elements (the lobby's and the meeting's), so only the lobby
 * one ever received srcObject and your own tile stayed black for the whole call.
 */
const VideoTile = ({ stream, name, isSelf = false, isSharingScreen = false, muted = false, hasVideo = true, connectionState }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !stream) return;

    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }

    // Autoplay can be rejected; without a catch this is an unhandled rejection.
    element.play?.().catch(() => {});
  }, [stream]);

  const isReconnecting = connectionState === "failed" || connectionState === "disconnected";

  return (
    <div
      className={[
        styles.tile,
        isSelf ? styles.tileSelf : "",
        isSharingScreen ? styles.isSharing : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <video
        ref={videoRef}
        autoPlay
        // playsInline is required or iOS Safari takes the video fullscreen.
        playsInline
        // Never play your own audio back — that's a feedback loop.
        muted={isSelf || muted}
        aria-label={isSelf ? "Your video" : `${name}'s video`}
      />

      {!hasVideo && (
        <div className={styles.tileAvatar} aria-hidden="true">
          {initialsOf(name)}
        </div>
      )}

      {isReconnecting && <div className={styles.tileOverlay}>Reconnecting…</div>}

      <div className={styles.tileLabel}>
        {muted && <MicOffRoundedIcon fontSize="inherit" aria-label="Muted" />}
        <span>{isSelf ? "You" : name}</span>
      </div>
    </div>
  );
};

export default VideoTile;
