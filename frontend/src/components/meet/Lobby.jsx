import { useEffect, useRef } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";

import Logo from "../Logo";

/** Pre-join screen: preview your camera, set your name, check your devices. */
const Lobby = ({
  roomId,
  username,
  onUsernameChange,
  onJoin,
  localStream,
  status,
  mediaError,
  devices,
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;
    if (element && localStream && element.srcObject !== localStream) {
      element.srcObject = localStream;
      element.play?.().catch(() => {});
    }
  }, [localStream]);

  const submit = (event) => {
    event.preventDefault();
    if (username.trim()) onJoin();
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        px: 2,
        py: 5,
      }}
    >
      <Logo />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 940,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          gap: { xs: 3, md: 5 },
          alignItems: "center",
        }}
      >
        <Box>
          <Box
            sx={{
              position: "relative",
              aspectRatio: "16 / 9",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#000",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Box
              component="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Your camera preview"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                // Mirror the preview so it reads like a mirror, not a recording.
                transform: "scaleX(-1)",
                display: videoEnabled ? "block" : "none",
              }}
            />

            {status === "pending" && <CircularProgress size={28} />}

            {status !== "pending" && !videoEnabled && (
              <Typography color="text.secondary" variant="body2" sx={{ position: "absolute" }}>
                Camera is off
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Tooltip title={devices.microphone ? (audioEnabled ? "Mute" : "Unmute") : "No microphone"}>
              <span>
                <IconButton
                  onClick={onToggleAudio}
                  disabled={!devices.microphone}
                  aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
                  aria-pressed={!audioEnabled}
                  color={audioEnabled ? "default" : "error"}
                >
                  {audioEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={devices.camera ? (videoEnabled ? "Turn off camera" : "Turn on camera") : "No camera"}>
              <span>
                <IconButton
                  onClick={onToggleVideo}
                  disabled={!devices.camera}
                  aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
                  aria-pressed={!videoEnabled}
                  color={videoEnabled ? "default" : "error"}
                >
                  {videoEnabled ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        <Box component="form" onSubmit={submit}>
          <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
            Ready to join?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Room{" "}
            <Box component="span" sx={{ fontFamily: "monospace", color: "text.primary" }}>
              {roomId}
            </Box>
          </Typography>

          <Stack spacing={2}>
            {/* The old lobby collected a name and never sent it anywhere. */}
            <TextField
              label="Your name"
              fullWidth
              autoFocus
              required
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              helperText="Shown to everyone in the call"
            />

            {mediaError && (
              <Alert severity={status === "denied" ? "warning" : "info"}>{mediaError}</Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={status === "pending" || !username.trim()}
            >
              {status === "pending" ? "Checking devices…" : "Join now"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Lobby;
