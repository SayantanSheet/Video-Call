import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FullPageLoader from "../components/FullPageLoader";

/**
 * Route guard.
 *
 * The previous version checked only that a token string existed in
 * localStorage, rendered the protected component while redirecting (a flash of
 * private UI), and sent users to /auth — a route that was commented out, so they
 * landed in the /:url catch-all and ended up inside a video room called "auth".
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the stored token to be validated before deciding.
  if (isLoading) {
    return <FullPageLoader label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    // Remember where they were headed so sign-in can send them back.
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
