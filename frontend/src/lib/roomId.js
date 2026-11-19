// Excludes l, o, 0 and 1 — the pairs people confuse when reading a code aloud.
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const GROUP_SIZE = 4;
const GROUP_COUNT = 3;

/**
 * Generates a room id like "k4mx-7prq-9dnf".
 *
 * Uses crypto.getRandomValues rather than Math.random: room ids are the only
 * thing protecting a call from being walked into by a stranger.
 */
export const createRoomId = () => {
  const bytes = new Uint32Array(GROUP_SIZE * GROUP_COUNT);
  crypto.getRandomValues(bytes);

  const characters = Array.from(bytes, (value) => ALPHABET[value % ALPHABET.length]);

  return Array.from({ length: GROUP_COUNT }, (_, group) =>
    characters.slice(group * GROUP_SIZE, (group + 1) * GROUP_SIZE).join("")
  ).join("-");
};

/** Accepts what a user might paste: a bare code, or a full meeting URL. */
export const normalizeRoomInput = (value) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";

  const fromUrl = trimmed.match(/\/room\/([^/?#]+)/);
  const candidate = fromUrl ? fromUrl[1] : trimmed;

  return candidate.toLowerCase().replace(/[^a-z0-9-]/g, "");
};
