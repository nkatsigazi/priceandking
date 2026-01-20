import { useState } from 'react';
import Logo from '../assets/logo-white.svg';

import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Paper,
  CssBaseline
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  ArrowForward
} from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('token/', { email, password });
      const { access, refresh } = res.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const userRes = await api.get('staff/me/');
      const user = userRes.data;

      navigate(user.role === 'CLIENT' ? '/portal' : '/dashboard');
    } catch (err: any) {
      alert(
        'Login Failed: ' +
          (err.response?.data?.detail || 'Invalid Credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />

      {/* 🔥 PAGE LAYOUT — CSS GRID */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '7fr 5fr'
          }
        }}
      >
        {/* LEFT SIDE — BRAND / IMAGE */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(147, 17, 17, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 8
            }}
          >
            <Box sx={{ textAlign: 'left', mb: 4 }}>
              <img src={Logo} alt="Price & King Logo" style={{ width: 300, height: 'auto' }} />
            </Box>
            <Typography variant="h2" color="white" fontWeight="bold">
              For Staff and Clients
            </Typography>
            <Typography
              color="rgba(212, 212, 212, 1)"
              sx={{ mt: 2, fontSize: '20px' }}
            >
              Price & King is one of the largest regional accounting, tax and business advisory firm based in Uganda.
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SIDE — LOGIN FORM */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fcffeb'
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: '100%',
              maxWidth: 420,
              p: 4
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" color="#931111">
                Welcome Back
              </Typography>
              <Typography color="text.secondary">
                Please sign in to access your workspace.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  // ── Custom focus & autofill styling ──
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      // Normal state
                      '& fieldset': {
                        borderColor: 'grey.400',
                      },
                      // Hover
                      '&:hover fieldset': {
                        borderColor: '#931111',
                      },
                      // Focused
                      '&.Mui-focused fieldset': {
                        borderColor: '#931111',
                        borderWidth: '2px', // optional: thicker focus border
                      },
                    },
                    // Fix ugly blue autofill background (Chrome/Safari)
                    '& .MuiInputBase-input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000 !important',
                      transition: 'background-color 5000s ease-in-out 0s',
                    },
                    '& .MuiInputBase-input:-webkit-autofill:hover': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                    },
                    '& .MuiInputBase-input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      borderColor: '#931111',
                    },
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  // Same styling for password field
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'grey.400',
                      },
                      '&:hover fieldset': {
                        borderColor: '#931111',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#931111',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#000 !important',
                      transition: 'background-color 5000s ease-in-out 0s',
                    },
                    '& .MuiInputBase-input:-webkit-autofill:hover': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                    },
                    '& .MuiInputBase-input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      borderColor: '#931111',
                    },
                  }}
                />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ textDecoration: 'none', color: '#931111' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ArrowForward />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: '#931111',
                  color: 'white',
                  fontSize: '1rem',
                  border: '2px solid #931111',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'white',
                    color: '#931111',
                    boxShadow: 'none',
                    border: '2px solid #931111',
                    '& .MuiButton-endIcon': {
                      color: '#931111',
                    }
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center', bgcolor: '#f8f8f8', p: 1, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Demo Credentials:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Admin: admin@pk.com | 1234@ABC
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Client: kk@pk.com | 1234@ABC
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 4 }}
              >
                © {new Date().getFullYear()} PriceKing & Co. All rights reserved.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Login;