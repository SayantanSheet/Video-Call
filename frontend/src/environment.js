/**
 * Backend base URL.
 *
 * Previously this hardcoded `IS_PROD = true` plus the Render URL, so local
 * development silently talked to the production backend and switching
 * environments meant editing source. Set REACT_APP_SERVER_URL in .env.local
 * (see .env.example); CRA only exposes REACT_APP_* variables.
 */
const server = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

export default server;
