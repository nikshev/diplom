import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Typography, Grid, Paper, Box, CircularProgress, Tabs, Tab } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

// Components
import BusinessOverview from '../../components/Analytics/BusinessOverview';
import SalesAnalytics from '../../components/Analytics/SalesAnalytics';
import FinancialAnalytics from '../../components/Analytics/FinancialAnalytics';
import InventoryAnalytics from '../../components/Analytics/InventoryAnalytics';
import CustomerAnalytics from '../../components/Analytics/CustomerAnalytics';

const Analytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('month');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Fetch business overview data
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery(
    ['businessOverview', timeframe],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/overview?timeframe=${timeframe}`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

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
          Error loading analytics data: {overviewError.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Business Overview" />
          <Tab label="Sales" />
          <Tab label="Financial" />
          <Tab label="Inventory" />
          <Tab label="Customers" />
        </Tabs>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Paper
              sx={{
                p: 1,
                cursor: 'pointer',
                bgcolor: timeframe === 'today' ? 'primary.main' : 'background.paper',
                color: timeframe === 'today' ? 'white' : 'text.primary',
              }}
              onClick={() => handleTimeframeChange('today')}
            >
              Today
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              sx={{
                p: 1,
                cursor: 'pointer',
                bgcolor: timeframe === 'week' ? 'primary.main' : 'background.paper',
                color: timeframe === 'week' ? 'white' : 'text.primary',
              }}
              onClick={() => handleTimeframeChange('week')}
            >
              This Week
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              sx={{
                p: 1,
                cursor: 'pointer',
                bgcolor: timeframe === 'month' ? 'primary.main' : 'background.paper',
                color: timeframe === 'month' ? 'white' : 'text.primary',
              }}
              onClick={() => handleTimeframeChange('month')}
            >
              This Month
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              sx={{
                p: 1,
                cursor: 'pointer',
                bgcolor: timeframe === 'quarter' ? 'primary.main' : 'background.paper',
                color: timeframe === 'quarter' ? 'white' : 'text.primary',
              }}
              onClick={() => handleTimeframeChange('quarter')}
            >
              This Quarter
            </Paper>
          </Grid>
          <Grid item>
            <Paper
              sx={{
                p: 1,
                cursor: 'pointer',
                bgcolor: timeframe === 'year' ? 'primary.main' : 'background.paper',
                color: timeframe === 'year' ? 'white' : 'text.primary',
              }}
              onClick={() => handleTimeframeChange('year')}
            >
              This Year
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {tabValue === 0 && <BusinessOverview data={overviewData} timeframe={timeframe} />}
      {tabValue === 1 && <SalesAnalytics timeframe={timeframe} />}
      {tabValue === 2 && <FinancialAnalytics timeframe={timeframe} />}
      {tabValue === 3 && <InventoryAnalytics timeframe={timeframe} />}
      {tabValue === 4 && <CustomerAnalytics timeframe={timeframe} />}
    </Box>
  );
};

export default Analytics;
