import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import ScreenShareRoundedIcon from "@mui/icons-material/ScreenShareRounded";
import StopScreenShareRoundedIcon from "@mui/icons-material/StopScreenShareRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";

import styles from "../../styles/videoComponent.module.css";

const baseButtonSx = {
  width: 48,
  height: 48,
  color: "text.primary",
  bgcolor: "rgba(255,255,255,0.06)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
  "&.Mui-disabled": { color: "text.disabled", bgcolor: "rgba(255,255,255,0.03)" },
};

const activeSx = {
  bgcolor: "error.main",
  color: "#fff",
  "&:hover": { bgcolor: "error.dark" },
};

const accentSx = {
  bgcolor: "primary.main",
  color: "#fff",
  "&:hover": { bgcolor: "primary.light" },
};

/**
 * Floating control pill.
 *
 * Every button carries an aria-label and aria-pressed — previously state was
 * conveyed by icon colour alone and none of the icon-only buttons had an
 * accessible name. The screen-share icon was also inverted.
 */
const ControlBar = ({
  audioEnabled,
  videoEnabled,
  isSharingScreen,
  canShareScreen,
  devices,
  chatOpen,
  unreadCount,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onLeave,
}) => (
  <div className={styles.controlBar}>
    <Tooltip title={devices.microphone ? (audioEnabled ? "Mute" : "Unmute") : "No microphone found"}>
      <span>
        <IconButton
          onClick={onToggleAudio}
          disabled={!devices.microphone}
          aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={!audioEnabled}
          sx={{ ...baseButtonSx, ...(audioEnabled ? {} : activeSx) }}
        >
          {audioEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>

    <Tooltip title={devices.camera ? (videoEnabled ? "Turn off camera" : "Turn on camera") : "No camera found"}>
      <span>
        <IconButton
          onClick={onToggleVideo}
          disabled={!devices.camera}
          aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
          aria-pressed={!videoEnabled}
          sx={{ ...baseButtonSx, ...(videoEnabled ? {} : activeSx) }}
        >
          {videoEnabled ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>

    <Tooltip
      title={
        canShareScreen
          ? isSharingScreen
            ? "Stop sharing"
            : "Share your screen"
          : "Screen sharing isn't supported on this device"
      }
    >
      <span>
        <IconButton
          onClick={onToggleScreenShare}
          disabled={!canShareScreen}
          aria-label={isSharingScreen ? "Stop sharing your screen" : "Share your screen"}
          aria-pressed={isSharingScreen}
          sx={{ ...baseButtonSx, ...(isSharingScreen ? accentSx : {}) }}
        >
          {isSharingScreen ? <StopScreenShareRoundedIcon /> : <ScreenShareRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>

    <Tooltip title={chatOpen ? "Hide chat" : "Show chat"}>
      <IconButton
        onClick={onToggleChat}
        aria-label={unreadCount > 0 ? `Open chat, ${unreadCount} unread` : "Toggle chat"}
        aria-pressed={chatOpen}
        sx={{ ...baseButtonSx, ...(chatOpen ? accentSx : {}) }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <ChatRoundedIcon />
        </Badge>
      </IconButton>
    </Tooltip>

    <Tooltip title="Leave the meeting">
      <IconButton
        onClick={onLeave}
        aria-label="Leave the meeting"
        sx={{ ...baseButtonSx, ...activeSx, width: 64, borderRadius: 999 }}
      >
        <CallEndRoundedIcon />
      </IconButton>
    </Tooltip>
  </div>
);

export default ControlBar;
