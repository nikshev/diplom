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

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

const CustomerAnalytics = ({ timeframe }) => {
  // Fetch customer analytics data
  const { data, isLoading, error } = useQuery(
    ['customerAnalytics', timeframe],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/customers?timeframe=${timeframe}&includeSegments=true&includeRetention=true`);
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
          Error loading customer analytics: {error.message}
        </Typography>
      </Box>
    );
  }

  // If we don't have data yet, show a placeholder
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6">No customer data available for the selected timeframe.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Customer Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeframe === 'today' && 'Today\'s Customer Metrics'}
        {timeframe === 'week' && 'This Week\'s Customer Metrics'}
        {timeframe === 'month' && 'This Month\'s Customer Metrics'}
        {timeframe === 'quarter' && 'This Quarter\'s Customer Metrics'}
        {timeframe === 'year' && 'This Year\'s Customer Metrics'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Total Customers
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.customer_count}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              New Customers
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.new_customers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Customer Retention Rate
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.retention_rate ? formatPercent(data.retention_rate) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Average Customer Value
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.average_customer_value)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.customer_growth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Customers" />
                <Line type="monotone" dataKey="new" stroke="#82ca9d" name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Segments
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.customer_segments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.customer_segments.map((entry, index) => (
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
              Customer Retention Cohort Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cohort</TableCell>
                    <TableCell align="right">New Customers</TableCell>
                    <TableCell align="right">Retained after 1 month</TableCell>
                    <TableCell align="right">Retained after 3 months</TableCell>
                    <TableCell align="right">Retained after 6 months</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.retention.cohorts.map((cohort) => (
                    <TableRow key={cohort.month}>
                      <TableCell>{cohort.month}</TableCell>
                      <TableCell align="right">{cohort.new_customers}</TableCell>
                      <TableCell align="right">
                        {cohort.retained_after_1m !== null 
                          ? `${cohort.retained_after_1m} (${((cohort.retained_after_1m / cohort.new_customers) * 100).toFixed(1)}%)` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {cohort.retained_after_3m !== null 
                          ? `${cohort.retained_after_3m} (${((cohort.retained_after_3m / cohort.new_customers) * 100).toFixed(1)}%)` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {cohort.retained_after_6m !== null 
                          ? `${cohort.retained_after_6m} (${((cohort.retained_after_6m / cohort.new_customers) * 100).toFixed(1)}%)` 
                          : 'N/A'}
                      </TableCell>
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
              Top Customers by Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.top_customers} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Acquisition Cost
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.acquisition_cost_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="cac" stroke="#8884d8" name="CAC" />
                <Line type="monotone" dataKey="ltv" stroke="#82ca9d" name="LTV" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerAnalytics;
