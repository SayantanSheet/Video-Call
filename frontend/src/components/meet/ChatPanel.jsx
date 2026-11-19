import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import styles from "../../styles/videoComponent.module.css";

const ChatPanel = ({ open, onClose, messages, mySocketId, onSend, isMobile }) => {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  // Keep the newest message visible. The original had no scroll container at
  // all — it referenced a CSS class that was never defined.
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return; // empty messages were previously allowed
    onSend(draft);
    setDraft("");
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      // Keeps the video playing underneath instead of trapping the page.
      variant="persistent"
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 360,
          height: isMobile ? "70dvh" : "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          borderLeft: isMobile ? "none" : 1,
          borderColor: "divider",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6">Chat</Typography>
        <IconButton onClick={onClose} aria-label="Close chat" size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Announce incoming messages to screen readers. */}
      <div className={styles.chatScroll} aria-live="polite" aria-atomic="false">
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ m: "auto", textAlign: "center" }}>
            No messages yet. Say hello.
          </Typography>
        ) : (
          messages.map((message, index) => {
            const isMine = message.senderSocketId === mySocketId;

            return (
              <Box
                key={`${message.senderSocketId}-${index}-${message.data}`}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {!isMine && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {message.sender}
                  </Typography>
                )}
                <Box
                  sx={{
                    px: 1.75,
                    py: 1.125,
                    borderRadius: 2.5,
                    bgcolor: isMine ? "primary.main" : "action.hover",
                    color: isMine ? "primary.contrastText" : "text.primary",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body2">{message.data}</Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <Box
        component="form"
        onSubmit={submit}
        sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Send a message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          // htmlInput puts the label on the <input> itself; passing aria-label
          // to TextField only labels the wrapper, which screen readers ignore.
          slotProps={{
            htmlInput: { "aria-label": "Message" },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    aria-label="Send message"
                    disabled={!draft.trim()}
                    edge="end"
                  >
                    <SendRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Drawer>
  );
};

export default ChatPanel;
