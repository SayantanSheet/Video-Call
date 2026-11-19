import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";

import AppBar from "../components/AppBar";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import { toErrorMessage } from "../lib/apiClient";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const History = () => {
  const { getHistoryOfUser } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setMeetings(await getHistoryOfUser());
    } catch (err) {
      setError(toErrorMessage(err, "Could not load your meeting history"));
    } finally {
      setIsLoading(false);
    }
  }, [getHistoryOfUser]);

  useEffect(() => {
    load();
  }, [load]);

  const renderBody = () => {
    // All three of these states were missing: the page rendered nothing while
    // loading, nothing on error, and a bare icon when the list was empty.
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }} role="status">
          <CircularProgress size={28} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    if (meetings.length === 0) {
      return (
        <EmptyState
          icon={<VideocamOffRoundedIcon />}
          title="No meetings yet"
          description="Meetings you start or join will show up here."
          action={
            <Button variant="contained" onClick={() => navigate("/home")}>
              Start a meeting
            </Button>
          }
        />
      );
    }

    return (
      <Stack spacing={1.5}>
        {meetings.map((meeting) => (
          // The key used to sit on the Card while the mapped root was an
          // un-keyed fragment.
          <Paper
            key={meeting._id ?? `${meeting.meetingCode}-${meeting.date}`}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontFamily: "monospace" }} noWrap>
                {meeting.meetingCode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(meeting.date)}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(`/room/${meeting.meetingCode}`)}
            >
              Rejoin
            </Button>
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <AppBar />

      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, sm: 6 } }}>
        <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>
          Meeting history
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Your most recent meetings.
        </Typography>

        {renderBody()}
      </Container>
    </Box>
  );
};

export default History;
