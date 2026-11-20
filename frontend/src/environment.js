/**
 * Backend base URL.
 *
 * Previously this hardcoded `IS_PROD = true` plus the Render URL, so local
 * development silently talked to the production backend and switching
 * environments meant editing source. Set REACT_APP_SERVER_URL in .env.local
 * (see .env.example); CRA only exposes REACT_APP_* variables.
 */
const raw = (process.env.REACT_APP_SERVER_URL || "http://localhost:8000").trim();

/**
 * Render's blueprint `fromService` injects a bare host (`api.onrender.com`)
 * rather than a full URL, so add the scheme when it is missing. Localhost gets
 * http, anything else https.
 */
const withScheme = (value) => {
  if (/^https?:\/\//i.test(value)) return value;
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(value);
  return `${isLocal ? "http" : "https"}://${value}`;
};

// Trailing slashes would produce "//api/v1" once paths are appended.
const server = withScheme(raw).replace(/\/+$/, "");

export default server;
