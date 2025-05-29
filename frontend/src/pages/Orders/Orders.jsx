import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  Receipt as ReceiptIcon
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

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [filter, setFilter] = useState({
    status: '',
    customer: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch orders
  const { data, isLoading, error } = useQuery(
    ['orders', page, rowsPerPage, filter],
    async () => {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filter.status && { status: filter.status }),
        ...(filter.customer && { customer: filter.customer }),
        ...(filter.search && { search: filter.search }),
        ...(filter.dateFrom && { dateFrom: filter.dateFrom }),
        ...(filter.dateTo && { dateTo: filter.dateTo }),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await orderApi.getOrders(params);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  // Delete order mutation
  const deleteOrderMutation = useMutation(
    (orderId) => orderApi.deleteOrder(orderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        setDeleteDialogOpen(false);
      }
    }
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  // Handle create order
  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/orders/${orderId}/edit`);
  };

  // Handle view order
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Handle delete order
  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrderMutation.mutate(orderToDelete.id);
    }
  };

  // Handle create invoice
  const handleCreateInvoice = (orderId) => {
    navigate(`/invoices/new?orderId=${orderId}`);
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
          Помилка завантаження замовлень: {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={() => queryClient.invalidateQueries('orders')}
          sx={{ mt: 2 }}
        >
          Повторити
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Замовлення</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateOrder}
        >
          Створити замовлення
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Пошук"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              placeholder="Номер, клієнт..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                label="Статус"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Всі статуси</MenuItem>
                <MenuItem value="pending">Очікує</MenuItem>
                <MenuItem value="processing">Обробляється</MenuItem>
                <MenuItem value="shipped">Відправлено</MenuItem>
                <MenuItem value="delivered">Доставлено</MenuItem>
                <MenuItem value="cancelled">Скасовано</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Від"
              name="dateFrom"
              type="date"
              value={filter.dateFrom}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="До"
              name="dateTo"
              type="date"
              value={filter.dateTo}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => queryClient.invalidateQueries('orders')}
            >
              Оновити
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Клієнт</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сума</TableCell>
              <TableCell>Дата створення</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.orders && data.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.name || 'Н/Д'}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(order.status)} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleViewOrder(order.id)}
                    title="Переглянути замовлення"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleEditOrder(order.id)}
                    title="Редагувати замовлення"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary" 
                    onClick={() => handleCreateInvoice(order.id)}
                    title="Створити рахунок"
                  >
                    <ReceiptIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteOrder(order)}
                    title="Видалити замовлення"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!data || !data.orders || data.orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Замовлення не знайдені
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Рядків на сторінці:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} з ${count}`}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Видалення замовлення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити замовлення #{orderToDelete?.id}? Ця дія не може бути скасована.
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

export default Orders;
