import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { customerApi } from '../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const validationSchema = Yup.object({
  first_name: Yup.string().required("Ім'я обов'язкове"),
  last_name: Yup.string().required("Прізвище обов'язкове"),
  email: Yup.string().email('Введіть коректний email').nullable(),
  phone: Yup.string().nullable(),
  type: Yup.string().required('Тип клієнта обов\'язковий'),
  status: Yup.string().required('Статус обов\'язковий'),
  company_name: Yup.string().when('type', {
    is: 'business',
    then: Yup.string().required('Назва компанії обов\'язкова для юридичних осіб')
  }),
  tax_id: Yup.string().when('type', {
    is: 'business',
    then: Yup.string().required('Податковий номер обов\'язковий для юридичних осіб')
  })
});

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch customer if in edit mode
  const { data: customerData, isLoading: customerLoading, error: customerError } = useQuery(
    ['customer', id],
    async () => {
      const response = await customerApi.getCustomerById(id);
      return response.data;
    },
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false
    }
  );

  // Create customer mutation
  const createCustomerMutation = useMutation(
    (customerData) => customerApi.createCustomer(customerData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('customers');
        navigate(`/customers/${response.data.id}`);
      }
    }
  );

  // Update customer mutation
  const updateCustomerMutation = useMutation(
    (customerData) => customerApi.updateCustomer(id, customerData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['customer', id]);
        queryClient.invalidateQueries('customers');
        navigate(`/customers/${id}`);
      }
    }
  );

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      type: 'individual',
      status: 'active',
      company_name: '',
      tax_id: '',
      address: '',
      notes: ''
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditMode) {
        updateCustomerMutation.mutate(values);
      } else {
        createCustomerMutation.mutate(values);
      }
    }
  });

  // Set customer data when fetched
  useEffect(() => {
    if (customerData) {
      formik.setValues({
        first_name: customerData.first_name || '',
        last_name: customerData.last_name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        type: customerData.type || 'individual',
        status: customerData.status || 'active',
        company_name: customerData.company_name || '',
        tax_id: customerData.tax_id || '',
        address: customerData.address || '',
        notes: customerData.notes || ''
      });
    }
  }, [customerData]);

  // Handle cancel
  const handleCancel = () => {
    if (formik.dirty) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/customers/${id}`);
    } else {
      navigate('/customers');
    }
  };

  if (customerLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (customerError && isEditMode) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Помилка завантаження клієнта: {customerError.message}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customers')}
          sx={{ mt: 2 }}
        >
          Повернутися до списку
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/customers');
          }}
        >
          Клієнти
        </Link>
        <Typography color="text.primary">
          {isEditMode ? `Редагування клієнта: ${customerData?.first_name} ${customerData?.last_name}` : 'Новий клієнт'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditMode ? `Редагування клієнта: ${customerData?.first_name} ${customerData?.last_name}` : 'Новий клієнт'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{ mr: 1 }}
          >
            Скасувати
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={formik.handleSubmit}
            disabled={createCustomerMutation.isLoading || updateCustomerMutation.isLoading}
          >
            {createCustomerMutation.isLoading || updateCustomerMutation.isLoading
              ? 'Збереження...'
              : 'Зберегти'}
          </Button>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Основна інформація
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="first_name"
                    name="first_name"
                    label="Ім'я"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                    helperText={formik.touched.first_name && formik.errors.first_name}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="last_name"
                    name="last_name"
                    label="Прізвище"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                    helperText={formik.touched.last_name && formik.errors.last_name}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    error={formik.touched.type && Boolean(formik.errors.type)}
                  >
                    <InputLabel id="type-label">Тип клієнта</InputLabel>
                    <Select
                      labelId="type-label"
                      id="type"
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Тип клієнта"
                      required
                    >
                      <MenuItem value="individual">Фізична особа</MenuItem>
                      <MenuItem value="business">Юридична особа</MenuItem>
                    </Select>
                    {formik.touched.type && formik.errors.type && (
                      <FormHelperText>{formik.errors.type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
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
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Телефон"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    variant="outlined"
                    error={formik.touched.status && Boolean(formik.errors.status)}
                  >
                    <InputLabel id="status-label">Статус</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Статус"
                      required
                    >
                      <MenuItem value="active">Активний</MenuItem>
                      <MenuItem value="inactive">Неактивний</MenuItem>
                      <MenuItem value="pending">Очікує</MenuItem>
                    </Select>
                    {formik.touched.status && formik.errors.status && (
                      <FormHelperText>{formik.errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Business Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {formik.values.type === 'business' ? 'Інформація про компанію' : 'Додаткова інформація'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="company_name"
                    name="company_name"
                    label="Компанія"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                    helperText={formik.touched.company_name && formik.errors.company_name}
                    variant="outlined"
                    required={formik.values.type === 'business'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="tax_id"
                    name="tax_id"
                    label="Податковий номер"
                    value={formik.values.tax_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                    helperText={formik.touched.tax_id && formik.errors.tax_id}
                    variant="outlined"
                    required={formik.values.type === 'business'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Адреса"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Примітки
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Примітки"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Додаткова інформація про клієнта..."
              />
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Скасувати зміни?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете скасувати зміни? Всі незбережені дані будуть втрачені.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Ні</Button>
          <Button onClick={navigateBack} color="error" variant="contained">
            Так, скасувати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerForm;
