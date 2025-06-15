import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material';
import { financeApi } from '../../services/api';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await financeApi.getInvoiceById(id);
      setInvoice(response.data);
    } catch (err) {
      setError('Failed to load invoice details');
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/finance/invoices')}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box p={3}>
        <Alert severity="warning">Invoice not found</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/finance/invoices')}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/finance/invoices')}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Invoice #{invoice.invoice_number}
          </Typography>
          <Chip
            label={invoice.status}
            color={getStatusColor(invoice.status)}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {/* TODO: Navigate to edit invoice */}}
        >
          Edit Invoice
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Information
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">
                {invoice.invoice_number}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Issue Date
              </Typography>
              <Typography variant="body1">
                {new Date(invoice.issue_date).toLocaleDateString('uk-UA')}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1">
                {new Date(invoice.due_date).toLocaleDateString('uk-UA')}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={invoice.status}
                color={getStatusColor(invoice.status)}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Customer Name
              </Typography>
              <Typography variant="body1">
                {invoice.customer_name}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Customer Email
              </Typography>
              <Typography variant="body1">
                {invoice.customer_email || 'N/A'}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Customer Address
              </Typography>
              <Typography variant="body1">
                {invoice.customer_address || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">
                Subtotal:
              </Typography>
              <Typography variant="body1">
                {formatCurrency(invoice.subtotal || invoice.total_amount)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">
                Tax:
              </Typography>
              <Typography variant="body1">
                {formatCurrency(invoice.tax_amount || 0)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                Total:
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(invoice.total_amount)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {invoice.description && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {invoice.description}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default InvoiceDetails;
