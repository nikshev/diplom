import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { orderApi, customerApi, productApi } from '../../services/api';

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // Initial order state
  const initialOrderState = {
    customer_id: '',
    status: 'pending',
    payment_method: 'cash',
    payment_status: 'unpaid',
    shipping_address: '',
    notes: '',
    items: [],
    subtotal: 0,
    discount_amount: 0,
    shipping_cost: 0,
    tax_amount: 0,
    total_amount: 0
  };

  // State for order form
  const [order, setOrder] = useState(initialOrderState);
  
  // State for selected customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State for product selection dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDiscount, setProductDiscount] = useState(0);

  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch order if in edit mode
  const { data: orderData, isLoading: orderLoading, error: orderError } = useQuery(
    ['order', id],
    async () => {
      const response = await orderApi.getOrderById(id);
      return response.data;
    },
    {
      enabled: isEditMode,
      refetchOnWindowFocus: false
    }
  );

  // Fetch customers for autocomplete
  const { data: customersData, isLoading: customersLoading } = useQuery(
    'customers',
    async () => {
      const response = await customerApi.getCustomers({ limit: 100 });
      return response.data.customers;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Fetch products for autocomplete
  const { data: productsData, isLoading: productsLoading } = useQuery(
    'products',
    async () => {
      const response = await productApi.getProducts({ limit: 100 });
      return response.data.products;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => orderApi.createOrder(orderData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('orders');
        navigate(`/orders/${response.data.id}`);
      }
    }
  );

  // Update order mutation
  const updateOrderMutation = useMutation(
    (orderData) => orderApi.updateOrder(id, orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries('orders');
        navigate(`/orders/${id}`);
      }
    }
  );

  // Set order data when fetched
  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      if (orderData.customer) {
        setSelectedCustomer(orderData.customer);
      }
    }
  }, [orderData]);

  // Calculate totals when items change
  useEffect(() => {
    if (order.items.length > 0) {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discountAmount = order.items.reduce((sum, item) => {
        const itemDiscount = (item.price * item.quantity * item.discount) / 100;
        return sum + itemDiscount;
      }, 0);
      
      // Calculate tax (assuming 20% VAT)
      const taxRate = 0.2;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * taxRate;
      
      // Calculate total
      const total = subtotal - discountAmount + Number(order.shipping_cost || 0) + taxAmount;
      
      setOrder(prev => ({
        ...prev,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: total
      }));
    } else {
      setOrder(prev => ({
        ...prev,
        subtotal: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: Number(order.shipping_cost || 0)
      }));
    }
  }, [order.items, order.shipping_cost]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };

  // Handle customer selection
  const handleCustomerChange = (event, newValue) => {
    setSelectedCustomer(newValue);
    if (newValue) {
      setOrder(prev => ({ 
        ...prev, 
        customer_id: newValue.id,
        shipping_address: newValue.address || ''
      }));
    } else {
      setOrder(prev => ({ 
        ...prev, 
        customer_id: '',
        shipping_address: ''
      }));
    }
  };

  // Open product selection dialog
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
    setProductDiscount(0);
    setProductDialogOpen(true);
  };

  // Handle product selection
  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
  };

  // Handle product quantity change
  const handleQuantityChange = (e) => {
    setProductQuantity(Number(e.target.value));
  };

  // Handle product discount change
  const handleDiscountChange = (e) => {
    setProductDiscount(Number(e.target.value));
  };

  // Add product to order
  const addProductToOrder = () => {
    if (selectedProduct) {
      const newItem = {
        product_id: selectedProduct.id,
        product: selectedProduct,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: productQuantity,
        discount: productDiscount,
        total: (selectedProduct.price * productQuantity) * (1 - (productDiscount / 100))
      };
      
      setOrder(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      
      setProductDialogOpen(false);
    }
  };

  // Remove product from order
  const removeProduct = (index) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare order data for submission
    const orderData = {
      ...order,
      items: order.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      }))
    };
    
    if (isEditMode) {
      updateOrderMutation.mutate(orderData);
    } else {
      createOrderMutation.mutate(orderData);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (JSON.stringify(order) !== JSON.stringify(initialOrderState) && !isEditMode) {
      setCancelDialogOpen(true);
    } else {
      navigateBack();
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/orders/${id}`);
    } else {
      navigate('/orders');
    }
  };

  if (orderLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (orderError && isEditMode) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Помилка завантаження замовлення: {orderError.message}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
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
            navigate('/orders');
          }}
        >
          Замовлення
        </Link>
        <Typography color="text.primary">
          {isEditMode ? `Редагування замовлення #${id}` : 'Нове замовлення'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isEditMode ? `Редагування замовлення #${id}` : 'Нове замовлення'}
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
            onClick={handleSubmit}
            disabled={createOrderMutation.isLoading || updateOrderMutation.isLoading}
          >
            {createOrderMutation.isLoading || updateOrderMutation.isLoading
              ? 'Збереження...'
              : 'Зберегти'}
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Інформація про клієнта
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={customersData || []}
                    getOptionLabel={(option) => `${option.name} (${option.email || option.phone || 'Без контактів'})`}
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    loading={customersLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Клієнт"
                        variant="outlined"
                        required
                        fullWidth
                        error={!order.customer_id}
                        helperText={!order.customer_id ? 'Виберіть клієнта' : ''}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {customersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Статус"
                    name="status"
                    value={order.status}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    required
                  >
                    <MenuItem value="pending">Очікує</MenuItem>
                    <MenuItem value="processing">Обробляється</MenuItem>
                    <MenuItem value="shipped">Відправлено</MenuItem>
                    <MenuItem value="delivered">Доставлено</MenuItem>
                    <MenuItem value="cancelled">Скасовано</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Спосіб оплати"
                    name="payment_method"
                    value={order.payment_method}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    required
                  >
                    <MenuItem value="cash">Готівка</MenuItem>
                    <MenuItem value="card">Картка</MenuItem>
                    <MenuItem value="bank_transfer">Банківський переказ</MenuItem>
                    <MenuItem value="online">Онлайн оплата</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Статус оплати"
                    name="payment_status"
                    value={order.payment_status}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    required
                  >
                    <MenuItem value="unpaid">Не оплачено</MenuItem>
                    <MenuItem value="paid">Оплачено</MenuItem>
                    <MenuItem value="refunded">Повернуто</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Адреса доставки"
                    name="shipping_address"
                    value={order.shipping_address}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Товари
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                >
                  Додати товар
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Назва</TableCell>
                      <TableCell align="right">Ціна</TableCell>
                      <TableCell align="right">Кількість</TableCell>
                      <TableCell align="right">Знижка (%)</TableCell>
                      <TableCell align="right">Сума</TableCell>
                      <TableCell align="right">Дії</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.discount}%</TableCell>
                          <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeProduct(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" sx={{ py: 2 }}>
                            Немає товарів. Натисніть "Додати товар" для додавання товару до замовлення.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box mt={3} display="flex" justifyContent="flex-end">
                <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Сума:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" align="right">
                      {formatCurrency(order.subtotal)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Знижка:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" align="right">
                      {formatCurrency(order.discount_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Доставка:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="shipping_cost"
                      value={order.shipping_cost || ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">ПДВ:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" align="right">
                      {formatCurrency(order.tax_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Всього:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      {formatCurrency(order.total_amount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
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
                name="notes"
                value={order.notes}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                placeholder="Додаткова інформація про замовлення..."
              />
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* Product Selection Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="md">
        <DialogTitle>Додати товар</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={productsData || []}
                getOptionLabel={(option) => `${option.name} (${option.sku || 'Без артикула'})`}
                value={selectedProduct}
                onChange={handleProductChange}
                loading={productsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Товар"
                    variant="outlined"
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Ціна"
                value={selectedProduct?.price || ''}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Кількість"
                value={productQuantity}
                onChange={handleQuantityChange}
                variant="outlined"
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Знижка (%)"
                value={productDiscount}
                onChange={handleDiscountChange}
                variant="outlined"
                fullWidth
                type="number"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            {selectedProduct && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Typography variant="subtitle2">
                    Сума: {formatCurrency(selectedProduct.price * productQuantity * (1 - (productDiscount / 100)))}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={addProductToOrder}
            color="primary"
            variant="contained"
            disabled={!selectedProduct}
          >
            Додати
          </Button>
        </DialogActions>
      </Dialog>

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

export default OrderForm;
