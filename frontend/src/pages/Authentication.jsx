import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import { useNavigate } from 'react-router-dom';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {


    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();

    const [open, setOpen] = React.useState(false);
    const [formState, setFormState] = React.useState(0);
    const {handleRegister, handleLogin} = React.useContext(AuthContext);
    const navigate = useNavigate();

    let handleAuth=async ()=>{
        try{
          if(formState === 0){
            let result = await handleLogin(username, password);
            navigate('/home');
          }
          if(formState === 1){
          let result= await handleRegister(name, username, password);
          console.log(result);
          setUsername("");
          setMessage(result);
          setOpen(true);
          setError("");
          setFormState(0);
          setPassword("");
          }
        } catch(err){
         let message = (err.response.data.message);
          setError(message);
        }
    }
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
        
         
        />
        <Grid item xs={12} sm={8} md={5} >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>


            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              width: '100%',
              mb: 3,
              mt: 2
            }}>
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                color={formState === 0 ? 'primary' : 'inherit'}
                onClick={() => setFormState(0)}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  fontWeight: formState === 0 ? 700 : 400,
                  boxShadow: formState === 0 ? 2 : 0,
                  transition: 'all 0.2s',
                  fontSize: '1rem'
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                color={formState === 1 ? 'secondary' : 'inherit'}
                onClick={() => setFormState(1)}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  fontWeight: formState === 1 ? 700 : 400,
                  boxShadow: formState === 1 ? 2 : 0,
                  transition: 'all 0.2s',
                  fontSize: '1rem'
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
                {formState === 1 ?
                <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Full Name"
                name="username"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />
               :<></>}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{color:"red"}}>{error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState===0 ? "Login":"Register"}
              </Button>
              
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
      open={open}
      autoHideDuration={4000}
      message={message}
      />

    </ThemeProvider>
  );
}