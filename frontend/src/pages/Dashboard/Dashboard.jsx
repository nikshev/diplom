import React from 'react';
import { useQuery } from 'react-query';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Button, 
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart, 
  People, 
  Inventory,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

// Format percent
const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

// Metric card component
const MetricCard = ({ title, value, icon, trend, color, onClick }) => {
  const Icon = icon;
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend > 0 ? 'success.main' : 'error.main';

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s',
        '&:hover': onClick ? { transform: 'translateY(-5px)', boxShadow: 3 } : {}
      }}
      onClick={onClick}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
        <Icon sx={{ color }} />
      </Box>
      <Typography variant="h5" component="div" gutterBottom>
        {value}
      </Typography>
      {trend !== null && (
        <Box display="flex" alignItems="center">
          <TrendIcon sx={{ color: trendColor, fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: trendColor }}>
            {Math.abs(trend).toFixed(2)}% {trend > 0 ? 'зростання' : 'спадання'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch business overview
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useQuery(
    'businessOverview',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/overview?timeframe=month`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery(
    'recentOrders',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/orders?limit=5&sortBy=created_at&sortOrder=DESC`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch low stock items
  const { data: lowStockItems, isLoading: stockLoading } = useQuery(
    'lowStockItems',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/products/low-stock?limit=5`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch upcoming tasks
  const { data: upcomingTasks, isLoading: tasksLoading } = useQuery(
    'upcomingTasks',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/tasks?status=pending&limit=5`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Sample data for charts
  const salesData = [
    { name: 'Січ', value: 4000 },
    { name: 'Лют', value: 3000 },
    { name: 'Бер', value: 5000 },
    { name: 'Кві', value: 2780 },
    { name: 'Тра', value: 1890 },
    { name: 'Чер', value: 2390 },
  ];

  const salesByCategory = [
    { name: 'Категорія A', value: 400 },
    { name: 'Категорія B', value: 300 },
    { name: 'Категорія C', value: 300 },
    { name: 'Категорія D', value: 200 },
    { name: 'Категорія E', value: 100 },
  ];

  // Handle refresh
  const handleRefresh = () => {
    refetchOverview();
  };

  // Navigate to sections
  const navigateToOrders = () => navigate('/orders');
  const navigateToCustomers = () => navigate('/customers');
  const navigateToProducts = () => navigate('/products');
  const navigateToFinance = () => navigate('/finance');
  const navigateToAnalytics = () => navigate('/analytics');

  if (overviewLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (overviewError) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Помилка завантаження даних: {overviewError.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Оновити
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Панель управління</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
        >
          Оновити
        </Button>
      </Box>

      {/* Key metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Дохід" 
            value={overviewData?.financial?.revenue ? formatCurrency(overviewData.financial.revenue) : 'N/A'} 
            icon={AttachMoney} 
            trend={5.2} 
            color="primary.main" 
            onClick={navigateToFinance}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Замовлення" 
            value={overviewData?.sales?.order_count || 'N/A'} 
            icon={ShoppingCart} 
            trend={3.8} 
            color="secondary.main" 
            onClick={navigateToOrders}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Клієнти" 
            value={overviewData?.customers?.customer_count || 'N/A'} 
            icon={People} 
            trend={2.1} 
            color="info.main" 
            onClick={navigateToCustomers}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Прибуток" 
            value={overviewData?.financial?.profit ? formatCurrency(overviewData.financial.profit) : 'N/A'} 
            icon={TrendingUp} 
            trend={4.5} 
            color="success.main" 
            onClick={navigateToFinance}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Маржа" 
            value={overviewData?.financial?.profit_margin ? formatPercent(overviewData.financial.profit_margin) : 'N/A'} 
            icon={TrendingUp} 
            trend={-1.5} 
            color="warning.main" 
            onClick={navigateToAnalytics}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <MetricCard 
            title="Інвентар" 
            value={overviewData?.inventory?.inventory_value ? formatCurrency(overviewData.inventory.inventory_value) : 'N/A'} 
            icon={Inventory} 
            trend={0.8} 
            color="error.main" 
            onClick={navigateToProducts}
          />
        </Grid>
      </Grid>

      {/* Charts and lists */}
      <Grid container spacing={3}>
        {/* Sales chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Тренд продажів</Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/analytics/sales')}
              >
                Детальніше
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Продажі" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by category */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Продажі за категоріями</Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/analytics/sales')}
              >
                Детальніше
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent orders */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Останні замовлення
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {ordersLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : recentOrders?.orders?.length > 0 ? (
                <List>
                  {recentOrders.orders.map((order) => (
                    <ListItem
                      key={order.id}
                      secondaryAction={
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={`Замовлення #${order.id}`}
                        secondary={`${order.customer?.name || 'Клієнт'} - ${new Date(order.created_at).toLocaleDateString('uk-UA')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Немає замовлень
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={navigateToOrders} endIcon={<ArrowForwardIcon />}>
                Всі замовлення
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Low stock items */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Товари з низьким запасом
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {stockLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : lowStockItems?.items?.length > 0 ? (
                <List>
                  {lowStockItems.items.map((item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <Tooltip title={`Поріг: ${item.threshold}`}>
                          <Typography 
                            variant="body2" 
                            color={item.stock === 0 ? 'error' : 'warning.main'}
                          >
                            {item.stock} шт.
                          </Typography>
                        </Tooltip>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <WarningIcon color={item.stock === 0 ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`Категорія: ${item.category?.name || 'Не вказано'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Всі товари в достатній кількості
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={navigateToProducts} endIcon={<ArrowForwardIcon />}>
                Всі товари
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Upcoming tasks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Майбутні завдання
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {tasksLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : upcomingTasks?.tasks?.length > 0 ? (
                <List>
                  {upcomingTasks.tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="complete">
                          <CheckCircleIcon />
                        </IconButton>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={task.due_date ? `До: ${new Date(task.due_date).toLocaleDateString('uk-UA')}` : 'Без терміну'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Немає майбутніх завдань
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/tasks')} endIcon={<ArrowForwardIcon />}>
                Всі завдання
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
