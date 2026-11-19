import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { toErrorMessage } from "../lib/apiClient";

const SignIn = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await handleLogin(username, password);
      // Return them to whatever they were trying to reach, if anything.
      navigate(location.state?.from ?? "/home", { replace: true });
    } catch (err) {
      setError(toErrorMessage(err, "Sign in failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to start or join a meeting."
      footer={
        <>
          New here?{" "}
          <Link component={RouterLink} to="/signup" underline="hover">
            Create an account
          </Link>
        </>
      }
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            fullWidth
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || !username || !password}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default SignIn;
