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
  TextField
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  ShoppingCart as OrdersIcon
} from '@mui/icons-material';
import { customerApi } from '../../services/api';

const Customers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [filter, setFilter] = useState({
    search: '',
    type: '',
    status: ''
  });
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Fetch customers
  const { data, isLoading, error } = useQuery(
    ['customers', page, rowsPerPage, filter],
    async () => {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filter.search && { search: filter.search }),
        ...(filter.type && { type: filter.type }),
        ...(filter.status && { status: filter.status }),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await customerApi.getCustomers(params);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  // Delete customer mutation
  const deleteCustomerMutation = useMutation(
    (customerId) => customerApi.deleteCustomer(customerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
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

  // Handle create customer
  const handleCreateCustomer = () => {
    navigate('/customers/new');
  };

  // Handle edit customer
  const handleEditCustomer = (customerId) => {
    navigate(`/customers/${customerId}/edit`);
  };

  // Handle view customer
  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  // Handle view customer orders
  const handleViewCustomerOrders = (customerId) => {
    navigate(`/orders?customer=${customerId}`);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // Confirm delete customer
  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomerMutation.mutate(customerToDelete.id);
    }
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
          Помилка завантаження клієнтів: {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={() => queryClient.invalidateQueries('customers')}
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
        <Typography variant="h4">Клієнти</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateCustomer}
        >
          Додати клієнта
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Пошук"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              placeholder="Ім'я, email, телефон..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Тип"
              name="type"
              value={filter.type}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Всі типи</option>
              <option value="individual">Фізична особа</option>
              <option value="business">Юридична особа</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Статус"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Всі статуси</option>
              <option value="active">Активний</option>
              <option value="inactive">Неактивний</option>
              <option value="pending">Очікує</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => queryClient.invalidateQueries('customers')}
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
              <TableCell>Ім'я</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.customers && data.customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email || 'Н/Д'}</TableCell>
                <TableCell>{customer.phone || 'Н/Д'}</TableCell>
                <TableCell>{getCustomerTypeLabel(customer.type)}</TableCell>
                <TableCell>
                  <Chip 
                    label={getCustomerStatusLabel(customer.status)} 
                    color={getCustomerStatusColor(customer.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleViewCustomer(customer.id)}
                    title="Переглянути клієнта"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleEditCustomer(customer.id)}
                    title="Редагувати клієнта"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleViewCustomerOrders(customer.id)}
                    title="Замовлення клієнта"
                  >
                    <OrdersIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteCustomer(customer)}
                    title="Видалити клієнта"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!data || !data.customers || data.customers.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Клієнти не знайдені
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
        <DialogTitle>Видалення клієнта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити клієнта "{customerToDelete?.name}"? Ця дія не може бути скасована.
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

export default Customers;
