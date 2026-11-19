import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

import AppBar from "../components/AppBar";
import { useAuth } from "../contexts/AuthContext";
import { createRoomId, normalizeRoomInput } from "../lib/roomId";

const HomeComponent = () => {
  const navigate = useNavigate();
  const { user, addToUserHistory } = useAuth();

  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");

  const goToRoom = async (roomId) => {
    // Recording history is best-effort. It used to be awaited unguarded, so a
    // history failure silently prevented the user from joining at all.
    try {
      await addToUserHistory(roomId);
    } catch {
      // Non-fatal — the call matters more than the log entry.
    }
    navigate(`/room/${roomId}`);
  };

  const startNewMeeting = () => {
    setError("");
    goToRoom(createRoomId());
  };

  const joinMeeting = (event) => {
    event.preventDefault();

    const roomId = normalizeRoomInput(meetingCode);
    if (!roomId) {
      setError("Enter a meeting code or paste a meeting link.");
      return;
    }

    setError("");
    goToRoom(roomId);
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <AppBar />

      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 5, sm: 8 } }}>
        <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
          {user?.name ? `Hi ${user.name.split(" ")[0]}` : "Welcome"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 5 }}>
          Start a meeting and share the link, or join one with a code.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Creating a meeting was previously impossible from the UI — the
              dashboard only had a join field. */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Box aria-hidden="true" sx={{ color: "primary.light", mb: 1.5, "& svg": { fontSize: 30 } }}>
              <VideoCallRoundedIcon />
            </Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              New meeting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Creates a room with a fresh code you can share.
            </Typography>
            <Button variant="contained" fullWidth size="large" onClick={startNewMeeting}>
              Start a meeting
            </Button>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Box aria-hidden="true" sx={{ color: "primary.light", mb: 1.5, "& svg": { fontSize: 30 } }}>
              <LoginRoundedIcon />
            </Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Join a meeting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Paste a code or a full meeting link.
            </Typography>

            <Box component="form" onSubmit={joinMeeting}>
              <Stack spacing={1.5}>
                <TextField
                  label="Meeting code"
                  fullWidth
                  value={meetingCode}
                  onChange={(event) => setMeetingCode(event.target.value)}
                  placeholder="k4mx-7prq-9dnf"
                  error={Boolean(error)}
                />
                <Button type="submit" variant="outlined" color="inherit" fullWidth size="large">
                  Join
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default HomeComponent;
