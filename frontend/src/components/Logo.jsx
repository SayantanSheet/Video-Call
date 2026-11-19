import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

/** Wordmark used in the landing nav, the app bar, and the auth pages. */
const Logo = ({ compact = false }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
    <Box
      aria-hidden="true"
      sx={{
        display: "grid",
        placeItems: "center",
        width: 34,
        height: 34,
        borderRadius: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        "& svg": { fontSize: 20 },
      }}
    >
      <VideocamRoundedIcon />
    </Box>

    {!compact && (
      <Typography variant="h6" component="span" sx={{ letterSpacing: "-0.01em" }}>
        Apna Video Call
      </Typography>
    )}
  </Box>
);

export default Logo;
