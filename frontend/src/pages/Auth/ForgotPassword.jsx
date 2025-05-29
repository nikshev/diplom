import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string().email('Введіть коректний email').required("Email обов'язковий")
});

const ForgotPassword = () => {
  // State for success and error messages
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      await authApi.requestPasswordReset(values.email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка відправки запиту. Спробуйте пізніше.');
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <LockResetIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom>
              Відновлення паролю
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Введіть вашу електронну адресу, і ми надішлемо вам інструкції з відновлення паролю
            </Typography>

            {success ? (
              <Box width="100%">
                <Alert severity="success" sx={{ mb: 2 }}>
                  Інструкції з відновлення паролю надіслано на вашу електронну адресу.
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Повернутися до сторінки входу
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
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  variant="outlined"
                  required
                  sx={{ mb: 2 }}
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
                    'Відправити інструкції'
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

export default ForgotPassword;
