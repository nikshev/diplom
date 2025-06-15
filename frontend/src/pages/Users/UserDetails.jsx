import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { userApi } from '../../services/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUserById(id);
      setUser(response.data);
    } catch (err) {
      setError('Failed to load user details');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="warning">User not found</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mt: 2 }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/users')}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            User Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/users/${user.id}/edit`)}
        >
          Edit User
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            <Chip
              label={user.role}
              color={getRoleColor(user.role)}
              sx={{ mb: 1 }}
            />
            <br />
            <Chip
              label={user.is_active ? 'Active' : 'Inactive'}
              color={getStatusColor(user.is_active)}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {user.phone || 'Not provided'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(user.created_at).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(user.updated_at).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {user.id}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="body1">
                {user.is_active ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetails;
