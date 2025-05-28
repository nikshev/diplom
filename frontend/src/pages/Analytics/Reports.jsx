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
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const Reports = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for filtering
  const [filter, setFilter] = useState({
    type: '',
    isScheduled: '',
    search: ''
  });
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // Fetch reports
  const { data, isLoading, error } = useQuery(
    ['reports', page, rowsPerPage, filter],
    async () => {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filter.type && { type: filter.type }),
        ...(filter.isScheduled !== '' && { isScheduled: filter.isScheduled }),
        ...(filter.search && { search: filter.search }),
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await axios.get(`${API_BASE_URL}/reports?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  // Delete report mutation
  const deleteReportMutation = useMutation(
    (reportId) => axios.delete(`${API_BASE_URL}/reports/${reportId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
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

  // Handle create report
  const handleCreateReport = () => {
    navigate('/reports/new');
  };

  // Handle edit report
  const handleEditReport = (reportId) => {
    navigate(`/reports/${reportId}/edit`);
  };

  // Handle view report
  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  // Handle delete report
  const handleDeleteReport = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  // Confirm delete report
  const confirmDeleteReport = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate(reportToDelete.id);
    }
  };

  // Handle generate report
  const handleGenerateReport = (reportId) => {
    navigate(`/reports/${reportId}/generate`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('uk-UA');
  };

  // Get report type label
  const getReportTypeLabel = (type) => {
    const types = {
      'sales': 'Sales',
      'financial': 'Financial',
      'inventory': 'Inventory',
      'customer': 'Customer',
      'performance': 'Performance'
    };
    return types[type] || type;
  };

  // Get report format label
  const getReportFormatLabel = (format) => {
    const formats = {
      'pdf': 'PDF',
      'excel': 'Excel',
      'csv': 'CSV'
    };
    return formats[format] || format;
  };

  // Get status color
  const getStatusColor = (isScheduled) => {
    return isScheduled ? 'primary' : 'default';
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
          Error loading reports: {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={() => queryClient.invalidateQueries('reports')}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                label="Report Type"
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="inventory">Inventory</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Scheduled</InputLabel>
              <Select
                label="Scheduled"
                name="isScheduled"
                value={filter.isScheduled}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Scheduled</MenuItem>
                <MenuItem value="false">Not Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => queryClient.invalidateQueries('reports')}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell>Last Generated</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.reports && data.reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.name}</TableCell>
                <TableCell>{getReportTypeLabel(report.type)}</TableCell>
                <TableCell>{getReportFormatLabel(report.format)}</TableCell>
                <TableCell>
                  <Chip 
                    label={report.is_scheduled ? 'Scheduled' : 'Not Scheduled'} 
                    color={getStatusColor(report.is_scheduled)}
                    size="small"
                    icon={report.is_scheduled ? <ScheduleIcon /> : undefined}
                  />
                </TableCell>
                <TableCell>{report.last_generated_at ? formatDate(report.last_generated_at) : 'Never'}</TableCell>
                <TableCell>{formatDate(report.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleViewReport(report.id)}
                    title="View Report"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleEditReport(report.id)}
                    title="Edit Report"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary" 
                    onClick={() => handleGenerateReport(report.id)}
                    title="Generate Report"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteReport(report)}
                    title="Delete Report"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!data || !data.reports || data.reports.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No reports found
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
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report "{reportToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteReport} 
            color="error" 
            variant="contained"
            disabled={deleteReportMutation.isLoading}
          >
            {deleteReportMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
