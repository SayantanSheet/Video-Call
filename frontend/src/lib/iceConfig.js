import server from "../environment";

/** Used when the backend is unreachable — enough for most home networks. */
const FALLBACK_ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

let cached = null;

/**
 * Fetches ICE servers from the backend.
 *
 * TURN credentials deliberately do not live in the frontend: CRA inlines every
 * REACT_APP_* value into the public bundle, so anything put there is readable
 * by anyone who loads the page.
 */
export const fetchIceServers = async () => {
  if (cached) return cached;

  try {
    const response = await fetch(`${server}/api/v1/ice`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    cached = Array.isArray(data.iceServers) && data.iceServers.length
      ? data.iceServers
      : FALLBACK_ICE_SERVERS;
  } catch {
    // A failure here only costs us TURN; STUN-only still works for most peers.
    cached = FALLBACK_ICE_SERVERS;
  }

  return cached;
};
