import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import Logo from "./Logo";
import { useAuth } from "../contexts/AuthContext";

/** Top bar for the signed-in area (dashboard, history). */
const AppBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: { xs: 2, sm: 4 },
        py: 2,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        component={RouterLink}
        to="/home"
        sx={{ textDecoration: "none", color: "inherit" }}
        aria-label="Apna Video Call home"
      >
        <Logo />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
        {user?.name && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" }, mr: 1 }}
          >
            {user.name}
          </Typography>
        )}

        {/* Icon-only buttons previously had no accessible name at all. */}
        <Tooltip title="Meeting history">
          <IconButton aria-label="Meeting history" onClick={() => navigate("/history")}>
            <HistoryRoundedIcon />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          onClick={logout}
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
        >
          Log out
        </Button>

        <Tooltip title="Log out">
          <IconButton
            aria-label="Log out"
            onClick={logout}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AppBar;
