export const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
};

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const SCREEN_CONSTRAINTS = {
  video: { frameRate: { ideal: 15, max: 30 } },
  audio: false,
};

/** Maps a getUserMedia rejection to something a user can act on. */
export const describeMediaError = (error) => {
  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        reason: "denied",
        message:
          "Camera and microphone access was blocked. Allow it in your browser's address bar, then try again.",
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return {
        reason: "missing",
        message: "No camera or microphone was found. You can still join and listen.",
      };
    case "NotReadableError":
      return {
        reason: "busy",
        message: "Your camera or microphone is in use by another app. Close it and try again.",
      };
    default:
      return {
        reason: "unknown",
        message: "Couldn't access your camera or microphone. You can still join and listen.",
      };
  }
};

/** getUserMedia only exists in a secure context: HTTPS, or localhost. */
export const isMediaSupported = () =>
  typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

export const isScreenShareSupported = () =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";
