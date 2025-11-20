import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { LocalPharmacy } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(username, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #953553 0%, #7a2a43 100%)',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 20px rgba(149, 53, 83, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: '0 4px 20px rgba(149, 53, 83, 0.3)',
                },
                '50%': {
                  boxShadow: '0 4px 30px rgba(149, 53, 83, 0.5)',
                },
              },
            }}
          >
            <LocalPharmacy sx={{ fontSize: 48, color: 'white' }} />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 0.5,
            }}
          >
            Dev Systems
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              mb: 1,
            }}
          >
            Pharmacy Management
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sign in to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Demo Credentials: admin / admin123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
