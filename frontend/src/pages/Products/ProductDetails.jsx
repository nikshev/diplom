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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardMedia,
  TextField,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AddShoppingCart as AddToCartIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { productApi } from '../../services/api';

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
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
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

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for inventory adjustment dialog
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      const response = await productApi.getProductById(id);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!id && id !== 'undefined'
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    () => productApi.deleteProduct(id),
    {
      onSuccess: () => {
        navigate('/products');
      }
    }
  );

  // Adjust inventory mutation
  const adjustInventoryMutation = useMutation(
    (adjustmentData) => productApi.adjustInventory(id, adjustmentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['product', id]);
        setInventoryDialogOpen(false);
        setAdjustmentQuantity(0);
        setAdjustmentReason('');
      }
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle edit product
  const handleEditProduct = () => {
    navigate(`/products/${id}/edit`);
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = () => {
    deleteProductMutation.mutate();
  };

  // Handle inventory adjustment
  const handleInventoryAdjustment = () => {
    setInventoryDialogOpen(true);
  };

  // Submit inventory adjustment
  const submitInventoryAdjustment = () => {
    if (adjustmentQuantity !== 0) {
      adjustInventoryMutation.mutate({
        quantity: adjustmentQuantity,
        reason: adjustmentReason
      });
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
          Помилка завантаження товару: {error.message}
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

  if (!id || id === 'undefined') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Невірний ID продукту
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Повернутися до списку продуктів
        </Button>
      </Box>
    );
  }

  const stockStatus = getStockStatus(product);

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
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" mr={2}>
            {product.name}
          </Typography>
          <Chip
            label={stockStatus.label}
            color={stockStatus.color}
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mr: 1 }}
          >
            Назад
          </Button>
          {product.track_inventory && (
            <Button
              variant="outlined"
              startIcon={<InventoryIcon />}
              onClick={handleInventoryAdjustment}
              sx={{ mr: 1 }}
            >
              Коригувати запас
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditProduct}
            sx={{ mr: 1 }}
          >
            Редагувати
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteProduct}
          >
            Видалити
          </Button>
        </Box>
      </Box>

      {/* Product Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={product.image_url || 'https://via.placeholder.com/300x300?text=Немає+зображення'}
              alt={product.name}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatCurrency(product.price)}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Артикул: {product.sku || 'Н/Д'}
                </Typography>
                <Chip
                  label={stockStatus.label}
                  color={stockStatus.color}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Інформація про товар
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body1">
                  {product.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Категорія
                </Typography>
                <Typography variant="body1">
                  {product.category || 'Не вказано'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ціна
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(product.price)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Собівартість
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(product.cost_price)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Відстеження запасів
                </Typography>
                <Typography variant="body1">
                  {product.track_inventory ? 'Так' : 'Ні'}
                </Typography>
              </Grid>
              {product.track_inventory && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Кількість
                    </Typography>
                    <Typography variant="body1">
                      {product.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Поріг низького запасу
                    </Typography>
                    <Typography variant="body1">
                      {product.low_stock_threshold}
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Дата створення
                </Typography>
                <Typography variant="body1">
                  {formatDate(product.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Опис
                </Typography>
                <Typography variant="body1">
                  {product.description || 'Опис відсутній'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Деталі" />
          <Tab label="Історія запасів" />
          <Tab label="Історія продажів" />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Детальна інформація
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">
                  {product.details || 'Детальна інформація відсутня'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Технічні характеристики
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {product.specifications && product.specifications.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Характеристика</TableCell>
                          <TableCell>Значення</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.specifications.map((spec, index) => (
                          <TableRow key={index}>
                            <TableCell>{spec.name}</TableCell>
                            <TableCell>{spec.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1">
                    Технічні характеристики відсутні
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Історія запасів
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {product.inventory_history && product.inventory_history.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Кількість</TableCell>
                      <TableCell>Причина</TableCell>
                      <TableCell>Користувач</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.inventory_history.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>{record.reason}</TableCell>
                        <TableCell>{record.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1">
                Історія запасів відсутня
              </Typography>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Історія продажів
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {product.sales_history && product.sales_history.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Замовлення</TableCell>
                      <TableCell>Клієнт</TableCell>
                      <TableCell>Кількість</TableCell>
                      <TableCell align="right">Ціна</TableCell>
                      <TableCell align="right">Сума</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.sales_history.map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell>{sale.order_id}</TableCell>
                        <TableCell>{sale.customer_name}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.price)}</TableCell>
                        <TableCell align="right">{formatCurrency(sale.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1">
                Історія продажів відсутня
              </Typography>
            )}
          </Paper>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Видалення товару</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити товар "{product.name}"? Ця дія не може бути скасована.
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

      {/* Inventory Adjustment Dialog */}
      <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)}>
        <DialogTitle>Коригування запасу</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Поточна кількість: {product.quantity}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <IconButton 
                  onClick={() => setAdjustmentQuantity(prev => prev - 1)}
                  color="primary"
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  fullWidth
                  label="Кількість"
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  InputProps={{
                    inputProps: { min: -product.quantity }
                  }}
                  sx={{ mx: 1 }}
                />
                <IconButton 
                  onClick={() => setAdjustmentQuantity(prev => prev + 1)}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Причина"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={submitInventoryAdjustment}
            color="primary"
            variant="contained"
            disabled={adjustmentQuantity === 0 || adjustInventoryMutation.isLoading}
          >
            {adjustInventoryMutation.isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductDetails;
