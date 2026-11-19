import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ScreenShareRoundedIcon from "@mui/icons-material/ScreenShareRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { createRoomId } from "../lib/roomId";

const FEATURES = [
  {
    icon: <ScreenShareRoundedIcon />,
    title: "Share your screen",
    body: "Present a window or your whole desktop without dropping the call.",
  },
  {
    icon: <ChatRoundedIcon />,
    title: "Chat while you talk",
    body: "Send links and notes alongside the conversation.",
  },
  {
    icon: <LockRoundedIcon />,
    title: "Peer to peer",
    body: "Audio and video flow directly between participants, not through a server.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Previously "Join as Guest" hardcoded a single shared room id, so every
  // guest in the world landed in the same call.
  const startGuestMeeting = () => navigate(`/room/${createRoomId()}`);

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="lg">
        <Box
          component="nav"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 3,
          }}
        >
          <Logo />

          {/* These were <p onClick> and <div role="button"> with no tabIndex or
              key handling — unreachable by keyboard and screen readers. */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }} alignItems="center">
            <Button color="inherit" onClick={startGuestMeeting}>
              Join as guest
            </Button>
            {isAuthenticated ? (
              <Button variant="contained" component={RouterLink} to="/home">
                Dashboard
              </Button>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/signin">
                  Sign in
                </Button>
                <Button variant="contained" component={RouterLink} to="/signup">
                  Sign up
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ flex: 1, display: "flex", alignItems: "center", py: 6 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
            gap: { xs: 6, md: 8 },
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box>
            <Chip
              label="Free · No downloads"
              size="small"
              sx={{ mb: 3, bgcolor: "action.hover", color: "text.secondary" }}
            />

            <Typography variant="h1" component="h1" sx={{ mb: 2.5 }}>
              Connect with the people{" "}
              <Box component="span" sx={{ color: "primary.light" }}>
                who matter
              </Box>
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 520 }}>
              Secure, browser-based video meetings. Start a call in one click and share
              the link — nothing to install.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                size="large"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={startGuestMeeting}
              >
                Start a meeting
              </Button>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to={isAuthenticated ? "/home" : "/signup"}
              >
                {isAuthenticated ? "Go to dashboard" : "Create an account"}
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              aspectRatio: "4 / 3",
            }}
          >
            <Box
              component="img"
              src="/mobile.png"
              alt="Two people on a video call"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature.title}
              sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box aria-hidden="true" sx={{ color: "primary.light", mb: 1.5, "& svg": { fontSize: 26 } }}>
                {feature.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
