import { createRoomId, normalizeRoomInput } from "./roomId";

describe("createRoomId", () => {
  test("produces a grouped, readable code", () => {
    expect(createRoomId()).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
  });

  test("avoids characters that are ambiguous when read aloud", () => {
    const ids = Array.from({ length: 50 }, createRoomId).join("");
    expect(ids).not.toMatch(/[l1o0]/);
  });

  test("does not collide across many calls", () => {
    const ids = new Set(Array.from({ length: 500 }, createRoomId));
    expect(ids.size).toBe(500);
  });
});

describe("normalizeRoomInput", () => {
  test("accepts a bare code", () => {
    expect(normalizeRoomInput("k4mx-7prq-9dnf")).toBe("k4mx-7prq-9dnf");
  });

  test("extracts the code from a pasted meeting link", () => {
    expect(normalizeRoomInput("https://example.com/room/k4mx-7prq-9dnf")).toBe("k4mx-7prq-9dnf");
  });

  test("ignores query strings, which used to fork rooms", () => {
    expect(normalizeRoomInput("https://example.com/room/abcd-efgh-ijkl?ref=mail")).toBe(
      "abcd-efgh-ijkl"
    );
  });

  test("returns an empty string for blank input so callers can reject it", () => {
    expect(normalizeRoomInput("   ")).toBe("");
    expect(normalizeRoomInput(undefined)).toBe("");
  });
});
