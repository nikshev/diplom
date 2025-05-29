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
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { productApi } from '../../services/api';

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

const Products = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [filter, setFilter] = useState({
    search: '',
    category: '',
    status: ''
  });
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products
  const { data, isLoading, error } = useQuery(
    ['products', page, rowsPerPage, filter],
    async () => {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filter.search && { search: filter.search }),
        ...(filter.category && { category: filter.category }),
        ...(filter.status && { status: filter.status }),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await productApi.getProducts(params);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    (productId) => productApi.deleteProduct(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
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

  // Handle create product
  const handleCreateProduct = () => {
    navigate('/products/new');
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  // Handle view product
  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  // Get stock status
  const getStockStatus = (product) => {
    if (!product.track_inventory) return { label: 'Не відстежується', color: 'default' };
    
    if (product.quantity <= 0) {
      return { label: 'Немає в наявності', color: 'error' };
    } else if (product.quantity <= product.low_stock_threshold) {
      return { label: 'Низький запас', color: 'warning' };
    } else {
      return { label: 'В наявності', color: 'success' };
    }
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
          Помилка завантаження товарів: {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={() => queryClient.invalidateQueries('products')}
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
        <Typography variant="h4">Товари</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
        >
          Додати товар
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
              placeholder="Назва, артикул, опис..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Категорія"
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Всі категорії</option>
              <option value="electronics">Електроніка</option>
              <option value="clothing">Одяг</option>
              <option value="furniture">Меблі</option>
              <option value="food">Продукти харчування</option>
              <option value="other">Інше</option>
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
              <option value="low_stock">Низький запас</option>
              <option value="out_of_stock">Немає в наявності</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => queryClient.invalidateQueries('products')}
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
              <TableCell>Артикул</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Категорія</TableCell>
              <TableCell align="right">Ціна</TableCell>
              <TableCell align="right">Кількість</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.products && data.products.map((product) => {
              const stockStatus = getStockStatus(product);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>{product.sku || 'Н/Д'}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category || 'Н/Д'}</TableCell>
                  <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                  <TableCell align="right">
                    {product.track_inventory ? product.quantity : 'Н/Д'}
                    {product.track_inventory && product.quantity <= product.low_stock_threshold && (
                      <WarningIcon 
                        color="warning" 
                        fontSize="small" 
                        sx={{ ml: 1, verticalAlign: 'middle' }} 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={stockStatus.label} 
                      color={stockStatus.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleViewProduct(product.id)}
                      title="Переглянути товар"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditProduct(product.id)}
                      title="Редагувати товар"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteProduct(product)}
                      title="Видалити товар"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!data || !data.products || data.products.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Товари не знайдені
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
        <DialogTitle>Видалення товару</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити товар "{productToDelete?.name}"? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button 
            onClick={confirmDeleteProduct} 
            color="error" 
            variant="contained"
            disabled={deleteProductMutation.isLoading}
          >
            {deleteProductMutation.isLoading ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
