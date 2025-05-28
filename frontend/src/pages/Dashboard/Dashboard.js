import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  People,
  Inventory
} from '@mui/icons-material';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: { count: 0, total: 0 },
    customers: { count: 0, new: 0 },
    products: { count: 0, lowStock: 0 },
    revenue: { today: 0, month: 0 }
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll just simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          orders: { count: 125, total: 25 },
          customers: { count: 84, new: 12 },
          products: { count: 156, lowStock: 8 },
          revenue: { today: 2850, month: 42500 }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, subtitle, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: color,
                borderRadius: 1,
                p: 1,
                color: 'white'
              }}
            >
              {icon}
            </Box>
          </Grid>
        </Grid>
        <Typography color="textSecondary" variant="caption">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ЗАМОВЛЕННЯ"
            value={stats.orders.count}
            icon={<ShoppingCart />}
            subtitle={`${stats.orders.total} нових сьогодні`}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="КЛІЄНТИ"
            value={stats.customers.count}
            icon={<People />}
            subtitle={`${stats.customers.new} нових цього місяця`}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ТОВАРИ"
            value={stats.products.count}
            icon={<Inventory />}
            subtitle={`${stats.products.lowStock} товарів закінчуються`}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ДОХІД"
            value={`₴${stats.revenue.today.toLocaleString()}`}
            icon={<AttachMoney />}
            subtitle={`₴${stats.revenue.month.toLocaleString()} цього місяця`}
            color="#9c27b0"
          />
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Останні замовлення
            </Typography>
            <Divider sx={{ my: 2 }} />
            {/* In a real app, this would be a table of recent orders */}
            <Typography variant="body2" color="textSecondary">
              Немає даних про замовлення
            </Typography>
          </Paper>
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Популярні товари
            </Typography>
            <Divider sx={{ my: 2 }} />
            {/* In a real app, this would be a list of top selling products */}
            <Typography variant="body2" color="textSecondary">
              Немає даних про товари
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
