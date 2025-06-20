import React from 'react';
import { Grid, Paper, Typography, Box, Divider } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  ShoppingCart, 
  People, 
  Inventory 
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

const MetricCard = ({ title, value, icon, trend, color }) => {
  const Icon = icon;
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend > 0 ? 'success.main' : 'error.main';

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
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
            {Math.abs(trend).toFixed(2)}% {trend > 0 ? 'increase' : 'decrease'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const BusinessOverview = ({ data, timeframe }) => {
  if (!data) return null;

  // Use sales_trend data from API if available, otherwise fallback to sample data
  const revenueData = data.sales_trend || [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  // Transform sales_trend data for chart if it exists
  const chartData = data.sales_trend ? 
    data.sales_trend.map(item => ({
      name: new Date(item.date).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' }),
      value: item.value
    })) : revenueData;

  const salesByCategory = [
    { name: 'Category A', value: 400 },
    { name: 'Category B', value: 300 },
    { name: 'Category C', value: 300 },
    { name: 'Category D', value: 200 },
    { name: 'Category E', value: 100 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Business Overview
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeframe === 'today' && 'Today\'s Performance'}
        {timeframe === 'week' && 'This Week\'s Performance'}
        {timeframe === 'month' && 'This Month\'s Performance'}
        {timeframe === 'quarter' && 'This Quarter\'s Performance'}
        {timeframe === 'year' && 'This Year\'s Performance'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Revenue" 
            value={formatCurrency(data.revenue?.current || 0)} 
            icon={AttachMoney} 
            trend={data.revenue?.trend || 0} 
            color="primary.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Orders" 
            value={data.orders?.current || 'N/A'} 
            icon={ShoppingCart} 
            trend={data.orders?.trend || 0} 
            color="secondary.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Customers" 
            value={data.customers?.current || 'N/A'} 
            icon={People} 
            trend={data.customers?.trend || 0} 
            color="info.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Products" 
            value={data.products?.current || 'N/A'} 
            icon={Inventory} 
            trend={data.products?.trend || 0} 
            color="success.main" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
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
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(data.revenue?.current || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency((data.revenue?.current || 0) * 0.7)} {/* Mock expenses as 70% of revenue */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency((data.revenue?.current || 0) * 0.3)} {/* Mock profit as 30% of revenue */}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Profit
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessOverview;
