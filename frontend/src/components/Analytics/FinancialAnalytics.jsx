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

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

const FinancialAnalytics = ({ timeframe }) => {
  // Fetch financial analytics data
  const { data, isLoading, error } = useQuery(
    ['financialAnalytics', timeframe],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/financial?timeframe=${timeframe}&includeCategories=true&includeAccounts=true`);
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
          Error loading financial analytics: {error.message}
        </Typography>
      </Box>
    );
  }

  // If we don't have data yet, show a placeholder
  if (!data) {
    return (
      <Box p={3}>
        <Typography variant="h6">No financial data available for the selected timeframe.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Financial Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeframe === 'today' && 'Today\'s Financial Performance'}
        {timeframe === 'week' && 'This Week\'s Financial Performance'}
        {timeframe === 'month' && 'This Month\'s Financial Performance'}
        {timeframe === 'quarter' && 'This Quarter\'s Financial Performance'}
        {timeframe === 'year' && 'This Year\'s Financial Performance'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Revenue
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.revenue)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Expenses
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.expenses)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Profit
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {formatCurrency(data.profit)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary">
              Profit Margin
            </Typography>
            <Typography variant="h5" component="div" gutterBottom>
              {data.profit_margin ? formatPercent(data.profit_margin) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue vs Expenses Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.financial_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#ffc658" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expense Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.expense_categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.expense_categories.map((entry, index) => (
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
              Revenue Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenue_categories} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Balances
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.accounts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="balance" fill="#82ca9d" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cash Flow
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cash_flow} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="inflow" stackId="a" fill="#82ca9d" name="Inflow" />
                <Bar dataKey="outflow" stackId="a" fill="#ff8042" name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialAnalytics;
