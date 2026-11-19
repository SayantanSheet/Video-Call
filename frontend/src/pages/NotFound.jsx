import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Logo from "../components/Logo";

const NotFound = () => (
  <Box
    sx={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 2,
      px: 3,
    }}
  >
    <Logo />

    <Typography variant="h2" component="h1" sx={{ mt: 2 }}>
      Page not found
    </Typography>

    <Typography color="text.secondary" sx={{ maxWidth: 440 }}>
      That link doesn&apos;t lead anywhere. If you were trying to join a meeting, check the
      code and join from your dashboard.
    </Typography>

    <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap", justifyContent: "center" }}>
      <Button variant="contained" component={RouterLink} to="/home">
        Go to dashboard
      </Button>
      <Button variant="outlined" color="inherit" component={RouterLink} to="/">
        Back to home
      </Button>
    </Box>
  </Box>
);

export default NotFound;
