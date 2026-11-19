import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client, {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../lib/apiClient";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // Starts true so route guards can wait instead of flashing protected UI
  // before the stored token has been checked.
  const [isLoading, setIsLoading] = useState(true);

  /** Validates any stored token against the server once on mount. */
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!getStoredToken()) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const { data } = await client.get("/users/me");
        if (!cancelled) setUser(data.user);
      } catch {
        // The response interceptor already cleared an invalid token.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = useCallback(async (name, username, password) => {
    const { data } = await client.post("/users/register", { name, username, password });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const handleLogin = useCallback(async (username, password) => {
    const { data } = await client.post("/users/login", { username, password });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    navigate("/signin", { replace: true });
  }, [navigate]);

  const getHistoryOfUser = useCallback(async () => {
    const { data } = await client.get("/users/get_all_activity");
    // The old backend could return an error object with HTTP 200; callers
    // rendered it as a list and broke. Guarantee an array.
    return Array.isArray(data) ? data : [];
  }, []);

  const addToUserHistory = useCallback(async (meetingCode) => {
    const { data } = await client.post("/users/add_to_activity", {
      meeting_code: meetingCode,
    });
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      handleRegister,
      handleLogin,
      logout,
      getHistoryOfUser,
      addToUserHistory,
    }),
    [user, isLoading, handleRegister, handleLogin, logout, getHistoryOfUser, addToUserHistory]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
