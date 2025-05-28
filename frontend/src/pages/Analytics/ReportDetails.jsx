import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  CircularProgress, 
  Divider, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  GetApp as DownloadIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for executions pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State for generate dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    startDate: '',
    endDate: '',
    filters: {}
  });
  
  // State for schedule dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleParams, setScheduleParams] = useState({
    frequency: 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    hour: 0,
    minute: 0
  });

  // Fetch report details
  const { data: report, isLoading, error } = useQuery(
    ['report', id],
    async () => {
      const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Fetch report executions
  const { data: executionsData, isLoading: executionsLoading } = useQuery(
    ['reportExecutions', id, page, rowsPerPage],
    async () => {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
      
      const response = await axios.get(`${API_BASE_URL}/reports/${id}/executions?${params}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: tabValue === 1 // Only fetch when on executions tab
    }
  );

  // Generate report mutation
  const generateReportMutation = useMutation(
    (params) => axios.post(`${API_BASE_URL}/reports/${id}/generate`, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reportExecutions', id]);
        setGenerateDialogOpen(false);
        setTabValue(1); // Switch to executions tab
      }
    }
  );

  // Schedule report mutation
  const scheduleReportMutation = useMutation(
    (params) => axios.post(`${API_BASE_URL}/reports/${id}/schedule`, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report', id]);
        setScheduleDialogOpen(false);
      }
    }
  );

  // Unschedule report mutation
  const unscheduleReportMutation = useMutation(
    () => axios.post(`${API_BASE_URL}/reports/${id}/unschedule`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report', id]);
      }
    }
  );

  // Delete report mutation
  const deleteReportMutation = useMutation(
    () => axios.delete(`${API_BASE_URL}/reports/${id}`),
    {
      onSuccess: () => {
        navigate('/reports');
      }
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle generate params change
  const handleGenerateParamsChange = (event) => {
    const { name, value } = event.target;
    setGenerateParams(prev => ({ ...prev, [name]: value }));
  };

  // Handle schedule params change
  const handleScheduleParamsChange = (event) => {
    const { name, value } = event.target;
    setScheduleParams(prev => ({ ...prev, [name]: value }));
  };

  // Handle generate report
  const handleGenerateReport = () => {
    generateReportMutation.mutate(generateParams);
  };

  // Handle schedule report
  const handleScheduleReport = () => {
    scheduleReportMutation.mutate(scheduleParams);
  };

  // Handle unschedule report
  const handleUnscheduleReport = () => {
    unscheduleReportMutation.mutate();
  };

  // Handle download report file
  const handleDownloadReport = (executionId) => {
    window.open(`${API_BASE_URL}/reports/${id}/executions/${executionId}/download`, '_blank');
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

  // Get execution status color
  const getExecutionStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error'
    };
    return colors[status] || 'default';
  };

  // Get frequency label
  const getFrequencyLabel = (frequency) => {
    const frequencies = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly'
    };
    return frequencies[frequency] || frequency;
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
          Error loading report: {error.message}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={() => queryClient.invalidateQueries(['report', id])}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/reports')}
          sx={{ mr: 2 }}
        >
          Back to Reports
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {report.name}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />} 
          onClick={() => navigate(`/reports/${id}/edit`)}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
          onClick={() => setGenerateDialogOpen(true)}
          sx={{ mr: 1 }}
        >
          Generate
        </Button>
        {report.is_scheduled ? (
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<ScheduleIcon />}
            onClick={handleUnscheduleReport}
            disabled={unscheduleReportMutation.isLoading}
          >
            Unschedule
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Schedule
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Details" />
          <Tab label="Executions" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {getReportTypeLabel(report.type)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Format
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {getReportFormatLabel(report.format)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {report.description || 'No description'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {formatDate(report.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Generated
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {report.last_generated_at ? formatDate(report.last_generated_at) : 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Scheduled
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Chip 
                    label={report.is_scheduled ? 'Yes' : 'No'} 
                    color={report.is_scheduled ? 'primary' : 'default'}
                    size="small"
                    icon={report.is_scheduled ? <ScheduleIcon /> : undefined}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {report.is_scheduled && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Schedule Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Frequency
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {getFrequencyLabel(report.schedule.frequency)}
                    </Typography>
                  </Grid>
                  {report.schedule.frequency === 'weekly' && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Day of Week
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][report.schedule.dayOfWeek]}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {report.schedule.frequency === 'monthly' && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Day of Month
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {report.schedule.dayOfMonth}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {`${report.schedule.hour.toString().padStart(2, '0')}:${report.schedule.minute.toString().padStart(2, '0')}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Run
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {report.schedule.next_run ? formatDate(report.schedule.next_run) : 'Not scheduled'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {report.parameters && Object.keys(report.parameters).length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(report.parameters).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1">No parameters defined</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => deleteReportMutation.mutate()}
                disabled={deleteReportMutation.isLoading}
                sx={{ ml: 1 }}
              >
                Delete Report
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started At</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : executionsData && executionsData.executions && executionsData.executions.length > 0 ? (
                  executionsData.executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>{execution.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={execution.status} 
                          color={getExecutionStatusColor(execution.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(execution.started_at)}</TableCell>
                      <TableCell>{execution.completed_at ? formatDate(execution.completed_at) : '-'}</TableCell>
                      <TableCell>
                        {execution.completed_at && execution.started_at ? 
                          `${((new Date(execution.completed_at) - new Date(execution.started_at)) / 1000).toFixed(2)} sec` : 
                          '-'}
                      </TableCell>
                      <TableCell align="right">
                        {execution.status === 'completed' && (
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleDownloadReport(execution.id)}
                            title="Download Report"
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No executions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={executionsData?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Paper>
      )}

      {/* Generate Report Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Set parameters for generating the report.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={generateParams.startDate}
                onChange={handleGenerateParamsChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={generateParams.endDate}
                onChange={handleGenerateParamsChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            {/* Additional filters based on report type */}
            {report.type === 'sales' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Product Category</InputLabel>
                    <Select
                      name="filters.category"
                      value={generateParams.filters.category || ''}
                      onChange={handleGenerateParamsChange}
                      label="Product Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      <MenuItem value="category1">Category 1</MenuItem>
                      <MenuItem value="category2">Category 2</MenuItem>
                      <MenuItem value="category3">Category 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateReport} 
            variant="contained" 
            color="primary"
            disabled={generateReportMutation.isLoading}
          >
            {generateReportMutation.isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Set schedule parameters for automatic report generation.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={scheduleParams.frequency}
                  onChange={handleScheduleParamsChange}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {scheduleParams.frequency === 'weekly' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    name="dayOfWeek"
                    value={scheduleParams.dayOfWeek}
                    onChange={handleScheduleParamsChange}
                    label="Day of Week"
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {scheduleParams.frequency === 'monthly' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Day of Month</InputLabel>
                  <Select
                    name="dayOfMonth"
                    value={scheduleParams.dayOfMonth}
                    onChange={handleScheduleParamsChange}
                    label="Day of Month"
                  >
                    {[...Array(31)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Hour</InputLabel>
                <Select
                  name="hour"
                  value={scheduleParams.hour}
                  onChange={handleScheduleParamsChange}
                  label="Hour"
                >
                  {[...Array(24)].map((_, i) => (
                    <MenuItem key={i} value={i}>{i.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Minute</InputLabel>
                <Select
                  name="minute"
                  value={scheduleParams.minute}
                  onChange={handleScheduleParamsChange}
                  label="Minute"
                >
                  {[0, 15, 30, 45].map((minute) => (
                    <MenuItem key={minute} value={minute}>{minute.toString().padStart(2, '0')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleScheduleReport} 
            variant="contained" 
            color="primary"
            disabled={scheduleReportMutation.isLoading}
          >
            {scheduleReportMutation.isLoading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportDetails;
