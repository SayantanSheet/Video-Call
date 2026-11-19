import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

/** Shown while the app resolves something before it can render a route. */
const FullPageLoader = ({ label = "Loading…" }) => (
  <Box
    role="status"
    aria-live="polite"
    sx={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <CircularProgress size={32} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default FullPageLoader;
