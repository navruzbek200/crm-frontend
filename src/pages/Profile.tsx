import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (response) => {
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => {
      setError('Failed to update profile. Please try again.');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!user) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profile
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
            >
              Update Profile
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 