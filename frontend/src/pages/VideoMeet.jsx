import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import ChatPanel from "../components/meet/ChatPanel";
import ControlBar from "../components/meet/ControlBar";
import Lobby from "../components/meet/Lobby";
import VideoGrid from "../components/meet/VideoGrid";
import { useAuth } from "../contexts/AuthContext";
import { useLocalMedia } from "../hooks/useLocalMedia";
import { useWebRTC } from "../hooks/useWebRTC";
import styles from "../styles/videoComponent.module.css";

/**
 * Orchestrates the meeting: lobby, media, peer mesh, chat, controls.
 *
 * The previous version was a single 564-line component holding all of the
 * above, with no cleanup on unmount, deprecated WebRTC APIs, and state whose
 * types shifted between array, undefined, and boolean.
 */
const VideoMeetComponent = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const [hasJoined, setHasJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [chatOpen, setChatOpen] = useState(false); // closed by default; was open
  const [readCount, setReadCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const media = useLocalMedia();

  // Prefill from the signed-in account; guests type their own.
  useEffect(() => {
    if (user?.name) setUsername((current) => current || user.name);
  }, [user]);

  const rtc = useWebRTC({
    enabled: hasJoined,
    roomId,
    username: username.trim() || "Guest",
    localStream: media.localStream,
    outgoingVideoTrack: media.outgoingVideoTrack,
  });

  const { chatEvents } = rtc;

  // The server replays recent room history on join; those shouldn't count as
  // unread. Treat everything present at join time as already seen.
  const joinBaselineRef = useRef(null);
  useEffect(() => {
    if (hasJoined && joinBaselineRef.current === null) {
      joinBaselineRef.current = 0;
    }
  }, [hasJoined]);

  useEffect(() => {
    if (chatOpen) setReadCount(chatEvents.length);
  }, [chatOpen, chatEvents.length]);

  const unreadCount = Math.max(0, chatEvents.length - readCount);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard permission denied — not worth interrupting the call over.
    }
  };

  const leaveMeeting = () => {
    // Order matters: disconnect while the component still exists so the server
    // broadcasts user-left, then release the camera, then navigate.
    rtc.leave();
    media.stopAllMedia();
    navigate("/home");
  };

  const participantLabel = useMemo(() => {
    const total = rtc.participants.length + 1;
    return `${total} ${total === 1 ? "participant" : "participants"}`;
  }, [rtc.participants.length]);

  if (!hasJoined) {
    return (
      <Lobby
        roomId={roomId}
        username={username}
        onUsernameChange={setUsername}
        onJoin={() => setHasJoined(true)}
        localStream={media.localStream}
        status={media.status}
        mediaError={media.mediaError}
        devices={media.devices}
        videoEnabled={media.videoEnabled}
        audioEnabled={media.audioEnabled}
        onToggleVideo={media.toggleVideo}
        onToggleAudio={media.toggleAudio}
      />
    );
  }

  return (
    // data-chat-open drives --chat-width, so the grid and controls shift aside
    // for the chat drawer instead of being covered by it.
    <div className={styles.meetRoot} data-chat-open={chatOpen ? "true" : "false"}>
      <header className={styles.meetHeader}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <span className={styles.roomCode}>{roomId}</span>
          <Tooltip title="Copy meeting link">
            <IconButton size="small" onClick={copyLink} aria-label="Copy meeting link">
              <ContentCopyRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {participantLabel}
        </Typography>
      </header>

      {rtc.connectionError && (
        <Alert severity="warning" sx={{ mx: 1.5, mb: 1 }}>
          {rtc.connectionError}
        </Alert>
      )}

      <VideoGrid
        localStream={media.localStream}
        localName={username.trim() || "You"}
        isSharingScreen={media.isSharingScreen}
        videoEnabled={media.videoEnabled}
        audioEnabled={media.audioEnabled}
        participants={rtc.participants}
      />

      <ControlBar
        audioEnabled={media.audioEnabled}
        videoEnabled={media.videoEnabled}
        isSharingScreen={media.isSharingScreen}
        canShareScreen={media.canShareScreen}
        devices={media.devices}
        chatOpen={chatOpen}
        unreadCount={unreadCount}
        onToggleAudio={media.toggleAudio}
        onToggleVideo={media.toggleVideo}
        onToggleScreenShare={media.toggleScreenShare}
        onToggleChat={() => setChatOpen((open) => !open)}
        onLeave={leaveMeeting}
      />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatEvents}
        mySocketId={rtc.mySocketId}
        onSend={rtc.sendChatMessage}
        isMobile={isMobile}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Meeting link copied"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </div>
  );
};

export default VideoMeetComponent;
