import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

// Layout components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard pages
import Dashboard from './pages/Dashboard/Dashboard';

// Order pages
import Orders from './pages/Orders/Orders';
import OrderDetails from './pages/Orders/OrderDetails';
import CreateOrder from './pages/Orders/CreateOrder';

// Customer pages
import Customers from './pages/Customers/Customers';
import CustomerDetails from './pages/Customers/CustomerDetails';
import CreateCustomer from './pages/Customers/CreateCustomer';

// Inventory pages
import Products from './pages/Inventory/Products';
import ProductDetails from './pages/Inventory/ProductDetails';
import CreateProduct from './pages/Inventory/CreateProduct';

// Finance pages
import Transactions from './pages/Finance/Transactions';
import Invoices from './pages/Finance/Invoices';
import InvoiceDetails from './pages/Finance/InvoiceDetails';
import CreateInvoice from './pages/Finance/CreateInvoice';

// Analytics pages
import Analytics from './pages/Analytics/Analytics';
import Reports from './pages/Analytics/Reports';
import ReportDetails from './pages/Analytics/ReportDetails';

// User management pages
import Users from './pages/Users/Users';
import UserDetails from './pages/Users/UserDetails';
import CreateUser from './pages/Users/CreateUser';

// Context
import { AuthProvider } from './context/AuthContext';

// Create a client for React Query
const queryClient = new QueryClient();

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Orders */}
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<CreateOrder />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                
                {/* Customers */}
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/new" element={<CreateCustomer />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                
                {/* Inventory */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<CreateProduct />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                
                {/* Finance */}
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route path="/invoices/:id" element={<InvoiceDetails />} />
                
                {/* Analytics */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/:id" element={<ReportDetails />} />
                
                {/* User Management */}
                <Route path="/users" element={<Users />} />
                <Route path="/users/new" element={<CreateUser />} />
                <Route path="/users/:id" element={<UserDetails />} />
              </Route>
              
              {/* Redirect to login if not authenticated */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
