import "@testing-library/jest-dom";
import { webcrypto } from "node:crypto";

// CRA's bundled jsdom predates global crypto support. Browsers provide this
// natively, so the polyfill is test-environment only — production code keeps
// using the real Web Crypto API.
if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}
