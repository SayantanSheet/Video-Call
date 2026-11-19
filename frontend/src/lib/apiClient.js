import axios from "axios";
import server from "../environment";

export const TOKEN_STORAGE_KEY = "token";

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

const client = axios.create({
  baseURL: `${server}/api/v1`,
});

/**
 * Attaches the JWT as a Bearer header. The token used to travel as a URL query
 * parameter, which lands it in proxy and CDN access logs and in Referer headers.
 */
client.interceptors.request.use((requestConfig) => {
  const token = getStoredToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

/**
 * A 401 means the token is gone, expired, or invalid — drop it so the app stops
 * presenting the user as signed in. The redirect is left to the route guard.
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
    }
    return Promise.reject(error);
  }
);

/** Turns an axios failure into a message safe to render. */
export const toErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") return "Can't reach the server. Is the backend running?";
  return fallback;
};

export default client;
