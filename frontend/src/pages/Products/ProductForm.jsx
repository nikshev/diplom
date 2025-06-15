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
  FormHelperText,
  Switch,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { productApi } from '../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string().required("Назва товару обов'язкова"),
  sku: Yup.string().nullable(),
  price: Yup.number().required("Ціна обов'язкова").min(0, "Ціна не може бути від'ємною"),
  cost: Yup.number().nullable().min(0, "Собівартість не може бути від'ємною"),
  category: Yup.string().nullable(),
  description: Yup.string().nullable(),
  track_inventory: Yup.boolean(),
  quantity: Yup.number().when('track_inventory', (track_inventory, schema) => {
    return track_inventory 
      ? schema.required("Кількість обов'язкова").min(0, "Кількість не може бути від'ємною")
      : schema.nullable();
  }),
  low_stock_threshold: Yup.number().when('track_inventory', (track_inventory, schema) => {
    return track_inventory 
      ? schema.required("Поріг низького запасу обов'язковий").min(0, "Поріг не може бути від'ємним")
      : schema.nullable();
  })
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // State for specifications
  const [specifications, setSpecifications] = useState([]);
  const [newSpec, setNewSpec] = useState({ name: '', value: '' });

  // Fetch product if in edit mode
  const { data: productData, isLoading: productLoading, error: productError } = useQuery(
    ['product', id],
    async () => {
      const response = await productApi.getProductById(id);
      return response.data;
    },
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false
    }
  );

  // Create product mutation
  const createProductMutation = useMutation(
    (productData) => productApi.createProduct(productData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('products');
        navigate(`/products/${response.data.id}`);
      }
    }
  );

  // Update product mutation
  const updateProductMutation = useMutation(
    (productData) => productApi.updateProduct(id, productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', id]);
        queryClient.invalidateQueries('products');
        navigate(`/products/${id}`);
      }
    }
  );

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      sku: '',
      price: '',
      cost: '',
      category: '',
      description: '',
      details: '',
      image_url: '',
      track_inventory: true,
      quantity: 0,
      low_stock_threshold: 5
    },
    validationSchema,
    onSubmit: (values) => {
      const productData = {
        ...values,
        specifications
      };
      
      if (isEditMode) {
        updateProductMutation.mutate(productData);
      } else {
        createProductMutation.mutate(productData);
      }
    }
  });

  // Set product data when fetched
  useEffect(() => {
    if (productData) {
      formik.setValues({
        name: productData.name || '',
        sku: productData.sku || '',
        price: productData.price || '',
        cost: productData.cost || '',
        category: productData.category || '',
        description: productData.description || '',
        details: productData.details || '',
        image_url: productData.image_url || '',
        track_inventory: productData.track_inventory !== undefined ? productData.track_inventory : true,
        quantity: productData.quantity || 0,
        low_stock_threshold: productData.low_stock_threshold || 5
      });
      
      if (productData.specifications) {
        setSpecifications(productData.specifications);
      }
    }
  }, [productData]);

  // Handle cancel
  const handleCancel = () => {
    if (formik.dirty || specifications.length > 0) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/products/${id}`);
    } else {
      navigate('/products');
    }
  };

  // Handle add specification
  const handleAddSpecification = () => {
    if (newSpec.name.trim() && newSpec.value.trim()) {
      setSpecifications([...specifications, { ...newSpec }]);
      setNewSpec({ name: '', value: '' });
    }
  };

  // Handle remove specification
  const handleRemoveSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Handle specification input change
  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setNewSpec(prev => ({ ...prev, [name]: value }));
  };

  if (productLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (productError && isEditMode) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Помилка завантаження товару: {productError.message}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
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
            navigate('/products');
          }}
        >
          Товари
        </Link>
        <Typography color="text.primary">
          {isEditMode ? `Редагування товару: ${productData?.name}` : 'Новий товар'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditMode ? `Редагування товару: ${productData?.name}` : 'Новий товар'}
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
            disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
          >
            {createProductMutation.isLoading || updateProductMutation.isLoading
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
                    id="name"
                    name="name"
                    label="Назва товару"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="sku"
                    name="sku"
                    label="Артикул"
                    value={formik.values.sku}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.sku && Boolean(formik.errors.sku)}
                    helperText={formik.touched.sku && formik.errors.sku}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="price"
                    name="price"
                    label="Ціна"
                    type="number"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.price && Boolean(formik.errors.price)}
                    helperText={formik.touched.price && formik.errors.price}
                    variant="outlined"
                    required
                    InputProps={{
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="cost"
                    name="cost"
                    label="Собівартість"
                    type="number"
                    value={formik.values.cost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.cost && Boolean(formik.errors.cost)}
                    helperText={formik.touched.cost && formik.errors.cost}
                    variant="outlined"
                    InputProps={{
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="category-label">Категорія</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Категорія"
                    >
                      <MenuItem value="">Не вказано</MenuItem>
                      <MenuItem value="electronics">Електроніка</MenuItem>
                      <MenuItem value="clothing">Одяг</MenuItem>
                      <MenuItem value="furniture">Меблі</MenuItem>
                      <MenuItem value="food">Продукти харчування</MenuItem>
                      <MenuItem value="other">Інше</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="image_url"
                    name="image_url"
                    label="URL зображення"
                    value={formik.values.image_url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.image_url && Boolean(formik.errors.image_url)}
                    helperText={formik.touched.image_url && formik.errors.image_url}
                    variant="outlined"
                    placeholder="https://example.com/image.jpg"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Короткий опис"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Inventory */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Управління запасами
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.track_inventory}
                      onChange={(e) => {
                        formik.setFieldValue('track_inventory', e.target.checked);
                      }}
                      name="track_inventory"
                      color="primary"
                    />
                  }
                  label="Відстежувати запаси"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {formik.values.track_inventory && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="quantity"
                      name="quantity"
                      label="Кількість"
                      type="number"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                      helperText={formik.touched.quantity && formik.errors.quantity}
                      variant="outlined"
                      required
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="low_stock_threshold"
                      name="low_stock_threshold"
                      label="Поріг низького запасу"
                      type="number"
                      value={formik.values.low_stock_threshold}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.low_stock_threshold && Boolean(formik.errors.low_stock_threshold)}
                      helperText={formik.touched.low_stock_threshold && formik.errors.low_stock_threshold}
                      variant="outlined"
                      required
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              {!formik.values.track_inventory && (
                <Typography variant="body2" color="text.secondary">
                  Відстеження запасів вимкнено. Увімкніть цю опцію, щоб керувати кількістю товару на складі.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Детальна інформація
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                id="details"
                name="details"
                label="Детальний опис"
                value={formik.values.details}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.details && Boolean(formik.errors.details)}
                helperText={formik.touched.details && formik.errors.details}
                variant="outlined"
                multiline
                rows={4}
              />
            </Paper>
          </Grid>

          {/* Specifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Технічні характеристики
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Назва характеристики"
                    value={newSpec.name}
                    onChange={handleSpecChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    name="value"
                    label="Значення"
                    value={newSpec.value}
                    onChange={handleSpecChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddSpecification}
                    disabled={!newSpec.name.trim() || !newSpec.value.trim()}
                    sx={{ height: '100%' }}
                  >
                    Додати
                  </Button>
                </Grid>
              </Grid>
              
              {specifications.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Характеристика</TableCell>
                        <TableCell>Значення</TableCell>
                        <TableCell align="right">Дії</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {specifications.map((spec, index) => (
                        <TableRow key={index}>
                          <TableCell>{spec.name}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveSpecification(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Немає технічних характеристик. Додайте їх за допомогою форми вище.
                </Typography>
              )}
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

export default ProductForm;
