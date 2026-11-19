import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { toErrorMessage } from "../lib/apiClient";

const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 3;

const SignUp = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) =>
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

  // Mirrors the server's rules so users get feedback before a round trip.
  const usernameError =
    form.username && form.username.trim().length < MIN_USERNAME_LENGTH
      ? `At least ${MIN_USERNAME_LENGTH} characters`
      : "";
  const passwordError =
    form.password && form.password.length < MIN_PASSWORD_LENGTH
      ? `At least ${MIN_PASSWORD_LENGTH} characters`
      : "";

  const isValid =
    form.name.trim() &&
    form.username.trim().length >= MIN_USERNAME_LENGTH &&
    form.password.length >= MIN_PASSWORD_LENGTH;

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await handleRegister(form.name, form.username, form.password);
      // Registration signs the user in, so go straight to the dashboard
      // instead of the old setTimeout-then-redirect-to-sign-in dance.
      navigate("/home", { replace: true });
    } catch (err) {
      setError(toErrorMessage(err, "Could not create your account"));
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a few seconds and it's free."
      footer={
        <>
          Already have an account?{" "}
          <Link component={RouterLink} to="/signin" underline="hover">
            Sign in
          </Link>
        </>
      }
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            autoFocus
            required
            fullWidth
            value={form.name}
            onChange={updateField("name")}
          />

          <TextField
            label="Username"
            name="username"
            autoComplete="username"
            required
            fullWidth
            value={form.username}
            onChange={updateField("username")}
            error={Boolean(usernameError)}
            helperText={usernameError}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            fullWidth
            value={form.password}
            onChange={updateField("password")}
            error={Boolean(passwordError)}
            helperText={passwordError || `At least ${MIN_PASSWORD_LENGTH} characters`}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default SignUp;
