import React from 'react';
import { useQuery } from 'react-query';
import { Grid, Paper, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

const SalesAnalytics = ({ timeframe }) => {
  // Fetch sales analytics data
  const { data, isLoading, error } = useQuery(
    ['salesAnalytics', timeframe],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/sales?timeframe=${timeframe}&includeProducts=true&includeCategories=true&includeCustomers=true`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Error loading sales analytics: {error.message}
        </Typography>
      </Box>
    );
  }

  // If we don't have data yet, show a placeholder
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6">No sales data available for the selected timeframe.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Sales Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeframe === 'today' && 'Today\'s Sales Performance'}
        {timeframe === 'week' && 'This Week\'s Sales Performance'}
        {timeframe === 'month' && 'This Month\'s Sales Performance'}
        {timeframe === 'quarter' && 'This Quarter\'s Sales Performance'}
        {timeframe === 'year' && 'This Year\'s Sales Performance'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Sales
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.total_sales)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Orders
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.order_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Average Order Value
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.average_order_value)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Conversion Rate
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.conversion_rate ? `${data.conversion_rate.toFixed(2)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.sales_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Sales" />
                <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" />
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
                  data={data.sales_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.sales_by_category.map((entry, index) => (
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
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_products} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Sales Amount" />
                <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Channel
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.sales_by_channel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.sales_by_channel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_customers} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Purchase Amount" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesAnalytics;
