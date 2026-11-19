import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import Logo from "./Logo";

/** Shared chrome for the sign-in and sign-up pages. */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <Box
    sx={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      px: 2,
      py: 6,
    }}
  >
    <Box component={RouterLink} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
      <Logo />
    </Box>

    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 420,
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>

      {children}
    </Paper>

    {footer ? (
      <Typography variant="body2" color="text.secondary">
        {footer}
      </Typography>
    ) : null}
  </Box>
);

export default AuthLayout;
