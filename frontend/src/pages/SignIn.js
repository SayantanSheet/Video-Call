// SignIn.js
import React, { useState, useContext } from 'react';
import { Avatar, Button, CssBaseline, TextField, Box, Typography, Grid, Paper, Snackbar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const defaultTheme = createTheme();

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      await handleLogin(username, password);
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='landingPageContainer'>
    <Grid container component="main" sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2 }}>
      {/* <CssBaseline /> */}
      <Grid item xs={12} sm={8} md={5}>
        <Box
          sx={{
            my: 8,
            mx: 4,
            p: 4, // Optional padding inside the box
            border: '2px solid #1976d2', // Blue border
            borderRadius: 2, // Rounded corners
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 3, // Optional: subtle shadow for depth
            backgroundColor: 'white' // Optional: white background
          }}
        >

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Sign In</Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleAuth}>
              Sign In
            </Button>
            <Typography variant="body2" color='textSecondary'>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
    </div>

  );
}
