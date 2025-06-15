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
  TextField,
  MenuItem,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { orderApi } from '../../services/api';

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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch order details
  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    async () => {
      const response = await orderApi.getOrderById(id);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!id && id !== 'undefined' // Only fetch if ID is valid
    }
  );

  // Update order status mutation
  const updateStatusMutation = useMutation(
    (status) => orderApi.updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', id]);
        setStatusDialogOpen(false);
      }
    }
  );

  // Delete order mutation
  const deleteOrderMutation = useMutation(
    () => orderApi.deleteOrder(id),
    {
      onSuccess: () => {
        navigate('/orders');
      }
    }
  );

  // Validate order ID
  if (!id || id === 'undefined') {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Невірний ID замовлення
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Повернутися до списку замовлень
        </Button>
      </Box>
    );
  }

  // Handle edit order
  const handleEditOrder = () => {
    navigate(`/orders/${id}/edit`);
  };

  // Handle delete order
  const handleDeleteOrder = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = () => {
    deleteOrderMutation.mutate();
  };

  // Handle status change
  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  // Open status dialog
  const openStatusDialog = () => {
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  // Update status
  const updateStatus = () => {
    updateStatusMutation.mutate(newStatus);
  };

  // Handle create invoice
  const handleCreateInvoice = () => {
    navigate(`/invoices/new?orderId=${id}`);
  };

  // Handle print order
  const handlePrintOrder = () => {
    window.print();
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Get status label
  const getStatusLabel = (status) => {
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
          Помилка завантаження замовлення: {error.message}
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
        <Typography color="text.primary">Замовлення #{order.id}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" mr={2}>
            Замовлення #{order.id}
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(order.status)}
          color={getStatusColor(order.status)}
        />
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 1 }}
          >
            Назад
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShippingIcon />}
            onClick={openStatusDialog}
            sx={{ mr: 1 }}
          >
            Змінити статус
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleCreateInvoice}
            sx={{ mr: 1 }}
          >
            Створити рахунок
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintOrder}
            sx={{ mr: 1 }}
          >
            Друк
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditOrder}
            sx={{ mr: 1 }}
          >
            Редагувати
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteOrder}
          >
            Видалити
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Інформація про замовлення
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Номер замовлення
                </Typography>
                <Typography variant="body1">
                  {order.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Дата створення
                </Typography>
                <Typography variant="body1">
                  {formatDate(order.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Спосіб оплати
                </Typography>
                <Typography variant="body1">
                  {order.payment_method || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Статус оплати
                </Typography>
                <Typography variant="body1">
                  {order.payment_status === 'paid' ? 'Оплачено' : 'Не оплачено'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Дата оплати
                </Typography>
                <Typography variant="body1">
                  {order.payment_date ? formatDate(order.payment_date) : 'Не оплачено'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Customer Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Інформація про клієнта
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ім'я
                </Typography>
                <Typography variant="body1">
                  {order.customer?.name || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {order.customer?.email || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Телефон
                </Typography>
                <Typography variant="body1">
                  {order.customer?.phone || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Компанія
                </Typography>
                <Typography variant="body1">
                  {order.customer?.company || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Адреса доставки
                </Typography>
                <Typography variant="body1">
                  {order.shipping_address || 'Не вказано'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Товари
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Код</TableCell>
                    <TableCell>Назва</TableCell>
                    <TableCell align="right">Ціна</TableCell>
                    <TableCell align="right">Кількість</TableCell>
                    <TableCell align="right">Знижка</TableCell>
                    <TableCell align="right">Сума</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items && order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.sku || 'N/A'}</TableCell>
                      <TableCell>{item.product?.name || item.name || 'N/A'}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.discount ? `${item.discount}%` : '0%'}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
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
                  <Typography variant="subtitle2" align="right">
                    {formatCurrency(order.shipping_cost)}
                  </Typography>
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
            <Typography variant="body1">
              {order.notes || 'Немає приміток'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Змінити статус замовлення</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Виберіть новий статус для замовлення #{order.id}
          </DialogContentText>
          <TextField
            select
            fullWidth
            label="Статус"
            value={newStatus}
            onChange={handleStatusChange}
            variant="outlined"
          >
            <MenuItem value="pending">Очікує</MenuItem>
            <MenuItem value="processing">Обробляється</MenuItem>
            <MenuItem value="shipped">Відправлено</MenuItem>
            <MenuItem value="delivered">Доставлено</MenuItem>
            <MenuItem value="cancelled">Скасовано</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={updateStatus}
            color="primary"
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? 'Оновлення...' : 'Оновити'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Видалення замовлення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити замовлення #{order.id}? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={confirmDeleteOrder}
            color="error"
            variant="contained"
            disabled={deleteOrderMutation.isLoading}
          >
            {deleteOrderMutation.isLoading ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;
