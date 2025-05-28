import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Alert, 
  IconButton, 
  InputAdornment,
  CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Введіть коректну електронну пошту')
    .required('Електронна пошта обов\'язкова'),
  password: Yup.string()
    .required('Пароль обов\'язковий')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setLoginError('');
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Помилка входу. Перевірте ваші дані.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <LockOutlined sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
            <Typography component="h1" variant="h5">
              Вхід в систему
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label="Електронна пошта"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Увійти'}
            </Button>

            <Grid container>
              <Grid item xs>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Забули пароль?
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Немає облікового запису? Зареєструватися
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
