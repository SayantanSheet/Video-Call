import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Used wherever a list can legitimately be empty. The history page previously
 * rendered a bare Home icon and nothing else when a user had no meetings.
 */
const EmptyState = ({ icon, title, description, action }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1.5,
      py: { xs: 6, sm: 10 },
      px: 3,
    }}
  >
    {icon ? (
      <Box
        aria-hidden="true"
        sx={{
          display: "grid",
          placeItems: "center",
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.secondary",
          mb: 0.5,
          "& svg": { fontSize: 30 },
        }}
      >
        {icon}
      </Box>
    ) : null}

    <Typography variant="h6">{title}</Typography>

    {description ? (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    ) : null}

    {action ? <Box sx={{ mt: 1.5 }}>{action}</Box> : null}
  </Box>
);

export default EmptyState;
