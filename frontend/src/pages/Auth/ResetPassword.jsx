import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../../services/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Validation schema
const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Пароль повинен містити щонайменше 8 символів')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль повинен містити великі та малі літери, а також цифри'
    )
    .required("Пароль обов'язковий"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Паролі повинні співпадати')
    .required('Підтвердження паролю обов\'язкове')
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');
  
  // State for success and error messages
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token is provided
  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      setError('Недійсне посилання для скидання паролю. Спробуйте запросити новий лист.');
    }
  }, [token, email]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      await authApi.resetPassword({
        email,
        token,
        password: values.password
      });
      setSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка скидання паролю. Спробуйте пізніше.');
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <LockResetIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom>
              Скидання паролю
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Створіть новий пароль для вашого облікового запису
            </Typography>

            {!tokenValid ? (
              <Box width="100%">
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/forgot-password" variant="body2">
                    Запросити новий лист для скидання паролю
                  </Link>
                </Typography>
              </Box>
            ) : success ? (
              <Box width="100%">
                <Alert severity="success" sx={{ mb: 2 }}>
                  Ваш пароль успішно змінено. Зараз ви будете перенаправлені на сторінку входу.
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Перейти до сторінки входу
                  </Link>
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                {error && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Новий пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  variant="outlined"
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Підтвердження нового паролю"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  variant="outlined"
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{ mt: 1, mb: 2 }}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Змінити пароль'
                  )}
                </Button>

                <Box textAlign="center" mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    <Link component={RouterLink} to="/login" variant="body2">
                      Повернутися до сторінки входу
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
