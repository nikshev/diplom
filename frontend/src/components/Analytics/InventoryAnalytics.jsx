import React from 'react';
import { useQuery } from 'react-query';
import { Grid, Paper, Typography, Box, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(value);
};

const InventoryAnalytics = ({ timeframe }) => {
  // Fetch inventory analytics data
  const { data, isLoading, error } = useQuery(
    ['inventoryAnalytics', timeframe],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/inventory?timeframe=${timeframe}&includeCategories=true&includeLowStock=true`);
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
          Error loading inventory analytics: {error.message}
        </Typography>
      </Box>
    );
  }

  // If we don't have data yet, show a placeholder
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6">No inventory data available for the selected timeframe.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Inventory Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeframe === 'today' && 'Today\'s Inventory Status'}
        {timeframe === 'week' && 'This Week\'s Inventory Status'}
        {timeframe === 'month' && 'This Month\'s Inventory Status'}
        {timeframe === 'quarter' && 'This Quarter\'s Inventory Status'}
        {timeframe === 'year' && 'This Year\'s Inventory Status'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Inventory Value
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.inventory_value)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Products
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.total_products}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Low Stock Items
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.low_stock_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Out of Stock Items
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.out_of_stock_count}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.inventory_by_category} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Product Count by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.inventory_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.inventory_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.inventory_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Inventory Value" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.low_stock_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{item.stock}</TableCell>
                      <TableCell align="right">{item.threshold}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.stock * item.unit_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_selling_products} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity_sold" fill="#82ca9d" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Slow Moving Products
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.slow_moving_products} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} days`} />
                <Legend />
                <Bar dataKey="days_in_stock" fill="#ff8042" name="Days in Stock" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryAnalytics;
