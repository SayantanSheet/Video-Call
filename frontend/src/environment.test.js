/**
 * environment.js reads process.env at import time, so each case needs a fresh
 * module registry.
 */
const loadServerUrl = (value) => {
  let result;
  jest.isolateModules(() => {
    const previous = process.env.REACT_APP_SERVER_URL;
    if (value === undefined) delete process.env.REACT_APP_SERVER_URL;
    else process.env.REACT_APP_SERVER_URL = value;

    result = require("./environment").default;

    if (previous === undefined) delete process.env.REACT_APP_SERVER_URL;
    else process.env.REACT_APP_SERVER_URL = previous;
  });
  return result;
};

describe("server URL resolution", () => {
  test("defaults to localhost when unset", () => {
    expect(loadServerUrl(undefined)).toBe("http://localhost:8000");
  });

  test("leaves a full URL untouched", () => {
    expect(loadServerUrl("https://api.onrender.com")).toBe("https://api.onrender.com");
  });

  // Render's blueprint fromService injects a bare host, not a URL.
  test("adds https to a bare remote host", () => {
    expect(loadServerUrl("api.onrender.com")).toBe("https://api.onrender.com");
  });

  test("adds http, not https, to a bare localhost", () => {
    expect(loadServerUrl("localhost:8000")).toBe("http://localhost:8000");
  });

  test("strips a trailing slash so paths don't double up", () => {
    expect(loadServerUrl("https://api.onrender.com/")).toBe("https://api.onrender.com");
  });

  test("trims surrounding whitespace", () => {
    expect(loadServerUrl("  api.onrender.com  ")).toBe("https://api.onrender.com");
  });
});
