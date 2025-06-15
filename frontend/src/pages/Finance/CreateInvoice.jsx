import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { financeApi } from '../../services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: '',
    subtotal: '',
    tax_amount: '',
    total_amount: '',
    status: 'draft'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate total when subtotal or tax changes
    if (name === 'subtotal' || name === 'tax_amount') {
      const subtotal = parseFloat(name === 'subtotal' ? value : formData.subtotal) || 0;
      const tax = parseFloat(name === 'tax_amount' ? value : formData.tax_amount) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        total_amount: (subtotal + tax).toString()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string amounts to numbers
      const invoiceData = {
        ...formData,
        subtotal: parseFloat(formData.subtotal) || 0,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        total_amount: parseFloat(formData.total_amount) || 0
      };

      await financeApi.createInvoice(invoiceData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/invoices');
      }, 2000);
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
      console.error('Error creating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box p={3}>
        <Alert severity="success">
          Invoice created successfully! Redirecting to invoices list...
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/finance/invoices')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Invoice
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                select
                required
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Email"
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Issue Date"
                name="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Financial Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Subtotal (UAH)"
                name="subtotal"
                type="number"
                value={formData.subtotal}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tax Amount (UAH)"
                name="tax_amount"
                type="number"
                value={formData.tax_amount}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Amount (UAH)"
                name="total_amount"
                type="number"
                value={formData.total_amount}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
                required
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/finance/invoices')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateInvoice;
