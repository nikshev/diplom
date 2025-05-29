import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Chip,
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
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as OrdersIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { customerApi, orderApi } from '../../services/api';

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('uk-UA');
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch customer details
  const { data: customer, isLoading, error } = useQuery(
    ['customer', id],
    async () => {
      const response = await customerApi.getCustomerById(id);
      return response.data;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Fetch customer orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['customerOrders', id],
    async () => {
      const params = new URLSearchParams({
        customer_id: id,
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await orderApi.getOrders(params);
      return response.data;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Delete customer mutation
  const deleteCustomerMutation = useMutation(
    () => customerApi.deleteCustomer(id),
    {
      onSuccess: () => {
        navigate('/customers');
      }
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    navigate(`/customers/${id}/edit`);
  };

  // Handle delete customer
  const handleDeleteCustomer = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete customer
  const confirmDeleteCustomer = () => {
    deleteCustomerMutation.mutate();
  };

  // Handle view all orders
  const handleViewAllOrders = () => {
    navigate(`/orders?customer=${id}`);
  };

  // Handle view order
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Handle create order
  const handleCreateOrder = () => {
    navigate(`/orders/new?customer=${id}`);
  };

  // Get customer type label
  const getCustomerTypeLabel = (type) => {
    const types = {
      'individual': 'Фізична особа',
      'business': 'Юридична особа'
    };
    return types[type] || type;
  };

  // Get customer status color
  const getCustomerStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'inactive': 'error',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  // Get customer status label
  const getCustomerStatusLabel = (status) => {
    const labels = {
      'active': 'Активний',
      'inactive': 'Неактивний',
      'pending': 'Очікує'
    };
    return labels[status] || status;
  };

  // Get order status color
  const getOrderStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Get order status label
  const getOrderStatusLabel = (status) => {
    const labels = {
      'pending': 'Очікує',
      'processing': 'Обробляється',
      'shipped': 'Відправлено',
      'delivered': 'Доставлено',
      'cancelled': 'Скасовано'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Помилка завантаження клієнта: {error.message}
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
        <Typography color="text.primary">{customer.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" mr={2}>
            {customer.name}
          </Typography>
          <Chip
            label={getCustomerStatusLabel(customer.status)}
            color={getCustomerStatusColor(customer.status)}
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customers')}
            sx={{ mr: 1 }}
          >
            Назад
          </Button>
          <Button
            variant="outlined"
            startIcon={<OrdersIcon />}
            onClick={handleCreateOrder}
            sx={{ mr: 1 }}
          >
            Нове замовлення
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditCustomer}
            sx={{ mr: 1 }}
          >
            Редагувати
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCustomer}
          >
            Видалити
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Інформація" />
          <Tab label="Замовлення" />
          <Tab label="Історія" />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Customer Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Основна інформація
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID
                    </Typography>
                    <Typography variant="body1">
                      {customer.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Тип
                    </Typography>
                    <Typography variant="body1">
                      {getCustomerTypeLabel(customer.type)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Статус
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={getCustomerStatusLabel(customer.status)}
                        color={getCustomerStatusColor(customer.status)}
                        size="small"
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дата реєстрації
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(customer.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" mt={1}>
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {customer.email || 'Email не вказано'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <PhoneIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {customer.phone || 'Телефон не вказано'}
                      </Typography>
                    </Box>
                  </Grid>
                  {customer.company && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <BusinessIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {customer.company}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {customer.address && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center">
                        <LocationIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {customer.address}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Customer Stats */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Статистика
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Всього замовлень
                    </Typography>
                    <Typography variant="h5">
                      {customer.total_orders || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Загальна сума
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(customer.total_spent || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Середній чек
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(customer.average_order_value || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Останнє замовлення
                    </Typography>
                    <Typography variant="body1">
                      {customer.last_order_date ? formatDate(customer.last_order_date) : 'Немає замовлень'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Додаткова інформація
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">
                  {customer.notes || 'Немає додаткової інформації'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Останні замовлення
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<OrdersIcon />}
                onClick={handleViewAllOrders}
              >
                Всі замовлення
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {ordersLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell align="right">Сума</TableCell>
                        <TableCell align="right">Дії</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
                        ordersData.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={getOrderStatusLabel(order.status)} 
                                color={getOrderStatusColor(order.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleViewOrder(order.id)}
                                title="Переглянути замовлення"
                              >
                                <OrdersIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              Замовлення не знайдені
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {(!ordersData || !ordersData.orders || ordersData.orders.length === 0) && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<OrdersIcon />}
                      onClick={handleCreateOrder}
                    >
                      Створити замовлення
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Історія активності
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Історія активності клієнта буде доступна в наступних версіях
              </Typography>
            </Box>
          </Paper>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Видалення клієнта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити клієнта "{customer.name}"? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={confirmDeleteCustomer}
            color="error"
            variant="contained"
            disabled={deleteCustomerMutation.isLoading}
          >
            {deleteCustomerMutation.isLoading ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetails;
