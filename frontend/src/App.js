import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./utils/withAuth";

import LandingPage from "./pages/landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import HomeComponent from "./pages/home";
import History from "./pages/history";
import VideoMeetComponent from "./pages/VideoMeet";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* /auth was commented out while three places still linked to it, so
              users fell through to the catch-all and landed in a meeting room
              named "auth". Redirect instead of leaving a dead link. */}
          <Route path="/auth" element={<Navigate to="/signin" replace />} />

          <Route
            path="/home"
            element={
              <RequireAuth>
                <HomeComponent />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <History />
              </RequireAuth>
            }
          />

          {/* Meetings live under an explicit prefix. The old bare /:url
              catch-all turned every typo into a video room. */}
          <Route path="/room/:roomId" element={<VideoMeetComponent />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
