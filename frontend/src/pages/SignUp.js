// SignUp.js
import React, { useState, useContext } from 'react';
import { Avatar, Button, CssBaseline, TextField, Box, Typography, Grid, Snackbar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const defaultTheme = createTheme();

export default function SignUp() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const { handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      const res = await handleRegister(name, username, password);
      setMessage(res);
      setOpen(true);
      setError('');
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className='landingPageContainer'>
      <Grid container component="main" sx={{ height: '100vh',display:'flex',justifyContent:'center',alignItems:'center',px:2 }} >
        <CssBaseline />
        <Grid item xs={12} sm={8} md={5}>
          <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #1976d2', borderRadius: 2, p: 4, boxShadow: 3, backgroundColor: 'white' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">Sign Up</Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
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
                Register
              </Button>
              <Typography variant="body2"color='textSecondary'>
                Already have an account? <Link to="/signin">Sign In</Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
