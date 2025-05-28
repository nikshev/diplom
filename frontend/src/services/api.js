/**
 * API service for interacting with the backend
 */

import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} - Promise with user data
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Register user
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with user data
   */
  register: (userData) => api.post('/auth/register', userData),

  /**
   * Refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} - Promise with new tokens
   */
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  /**
   * Change password
   * @param {Object} passwordData - Password data
   * @returns {Promise} - Promise with result
   */
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Promise with result
   */
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),

  /**
   * Reset password
   * @param {Object} resetData - Reset data
   * @returns {Promise} - Promise with result
   */
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
};

/**
 * User API
 */
export const userApi = {
  /**
   * Get current user profile
   * @returns {Promise} - Promise with user profile
   */
  getProfile: () => api.get('/users/profile'),

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise} - Promise with updated profile
   */
  updateProfile: (profileData) => api.put('/users/profile', profileData),

  /**
   * Get users
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with users
   */
  getUsers: (params) => api.get('/users', { params }),

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} - Promise with user
   */
  getUserById: (id) => api.get(`/users/${id}`),

  /**
   * Create user
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with created user
   */
  createUser: (userData) => api.post('/users', userData),

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with updated user
   */
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise} - Promise with result
   */
  deleteUser: (id) => api.delete(`/users/${id}`),
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get business overview
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with business overview
   */
  getBusinessOverview: (params) => api.get('/analytics/overview', { params }),

  /**
   * Get recent orders
   * @param {number} limit - Limit
   * @returns {Promise} - Promise with recent orders
   */
  getRecentOrders: (limit = 5) => api.get('/orders', { params: { limit, sortBy: 'created_at', sortOrder: 'DESC' } }),

  /**
   * Get low stock items
   * @param {number} limit - Limit
   * @returns {Promise} - Promise with low stock items
   */
  getLowStockItems: (limit = 5) => api.get('/products/low-stock', { params: { limit } }),

  /**
   * Get upcoming tasks
   * @param {number} limit - Limit
   * @returns {Promise} - Promise with upcoming tasks
   */
  getUpcomingTasks: (limit = 5) => api.get('/tasks', { params: { status: 'pending', limit } }),
};

/**
 * Order API
 */
export const orderApi = {
  /**
   * Get orders
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with orders
   */
  getOrders: (params) => api.get('/orders', { params }),

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise} - Promise with order
   */
  getOrderById: (id) => api.get(`/orders/${id}`),

  /**
   * Create order
   * @param {Object} orderData - Order data
   * @returns {Promise} - Promise with created order
   */
  createOrder: (orderData) => api.post('/orders', orderData),

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} orderData - Order data
   * @returns {Promise} - Promise with updated order
   */
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise} - Promise with result
   */
  deleteOrder: (id) => api.delete(`/orders/${id}`),

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - Order status
   * @returns {Promise} - Promise with updated order
   */
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

/**
 * Customer API
 */
export const customerApi = {
  /**
   * Get customers
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with customers
   */
  getCustomers: (params) => api.get('/customers', { params }),

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise} - Promise with customer
   */
  getCustomerById: (id) => api.get(`/customers/${id}`),

  /**
   * Create customer
   * @param {Object} customerData - Customer data
   * @returns {Promise} - Promise with created customer
   */
  createCustomer: (customerData) => api.post('/customers', customerData),

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} customerData - Customer data
   * @returns {Promise} - Promise with updated customer
   */
  updateCustomer: (id, customerData) => api.put(`/customers/${id}`, customerData),

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise} - Promise with result
   */
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

/**
 * Product API
 */
export const productApi = {
  /**
   * Get products
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with products
   */
  getProducts: (params) => api.get('/products', { params }),

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise} - Promise with product
   */
  getProductById: (id) => api.get(`/products/${id}`),

  /**
   * Create product
   * @param {Object} productData - Product data
   * @returns {Promise} - Promise with created product
   */
  createProduct: (productData) => api.post('/products', productData),

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise} - Promise with updated product
   */
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise} - Promise with result
   */
  deleteProduct: (id) => api.delete(`/products/${id}`),

  /**
   * Get low stock products
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with low stock products
   */
  getLowStockProducts: (params) => api.get('/products/low-stock', { params }),
};

/**
 * Finance API
 */
export const financeApi = {
  /**
   * Get transactions
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with transactions
   */
  getTransactions: (params) => api.get('/finance/transactions', { params }),

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise} - Promise with transaction
   */
  getTransactionById: (id) => api.get(`/finance/transactions/${id}`),

  /**
   * Create transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise} - Promise with created transaction
   */
  createTransaction: (transactionData) => api.post('/finance/transactions', transactionData),

  /**
   * Get invoices
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with invoices
   */
  getInvoices: (params) => api.get('/finance/invoices', { params }),

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise} - Promise with invoice
   */
  getInvoiceById: (id) => api.get(`/finance/invoices/${id}`),

  /**
   * Create invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise} - Promise with created invoice
   */
  createInvoice: (invoiceData) => api.post('/finance/invoices', invoiceData),

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise} - Promise with updated invoice
   */
  updateInvoice: (id, invoiceData) => api.put(`/finance/invoices/${id}`, invoiceData),

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @returns {Promise} - Promise with result
   */
  deleteInvoice: (id) => api.delete(`/finance/invoices/${id}`),
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get business overview
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with business overview
   */
  getBusinessOverview: (params) => api.get('/analytics/overview', { params }),

  /**
   * Get sales analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with sales analytics
   */
  getSalesAnalytics: (params) => api.get('/analytics/sales', { params }),

  /**
   * Get financial analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with financial analytics
   */
  getFinancialAnalytics: (params) => api.get('/analytics/financial', { params }),

  /**
   * Get inventory analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with inventory analytics
   */
  getInventoryAnalytics: (params) => api.get('/analytics/inventory', { params }),

  /**
   * Get customer analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with customer analytics
   */
  getCustomerAnalytics: (params) => api.get('/analytics/customers', { params }),

  /**
   * Collect all metrics data
   * @returns {Promise} - Promise with result
   */
  collectAllMetrics: () => api.post('/analytics/collect'),

  /**
   * Collect metric data
   * @param {string} id - Metric ID
   * @returns {Promise} - Promise with result
   */
  collectMetricData: (id) => api.post(`/analytics/collect/${id}`),
};

/**
 * Report API
 */
export const reportApi = {
  /**
   * Get reports
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with reports
   */
  getReports: (params) => api.get('/reports', { params }),

  /**
   * Get report by ID
   * @param {string} id - Report ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with report
   */
  getReportById: (id, params) => api.get(`/reports/${id}`, { params }),

  /**
   * Create report
   * @param {Object} reportData - Report data
   * @returns {Promise} - Promise with created report
   */
  createReport: (reportData) => api.post('/reports', reportData),

  /**
   * Update report
   * @param {string} id - Report ID
   * @param {Object} reportData - Report data
   * @returns {Promise} - Promise with updated report
   */
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),

  /**
   * Delete report
   * @param {string} id - Report ID
   * @returns {Promise} - Promise with result
   */
  deleteReport: (id) => api.delete(`/reports/${id}`),

  /**
   * Generate report
   * @param {string} id - Report ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with result
   */
  generateReport: (id, params) => api.post(`/reports/${id}/generate`, params),

  /**
   * Get report executions
   * @param {string} id - Report ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with report executions
   */
  getReportExecutions: (id, params) => api.get(`/reports/${id}/executions`, { params }),

  /**
   * Schedule report
   * @param {string} id - Report ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise} - Promise with result
   */
  scheduleReport: (id, scheduleData) => api.post(`/reports/${id}/schedule`, scheduleData),

  /**
   * Unschedule report
   * @param {string} id - Report ID
   * @returns {Promise} - Promise with result
   */
  unscheduleReport: (id) => api.post(`/reports/${id}/unschedule`),
};

// Export all APIs
export default {
  auth: authApi,
  user: userApi,
  dashboard: dashboardApi,
  order: orderApi,
  customer: customerApi,
  product: productApi,
  finance: financeApi,
  analytics: analyticsApi,
  report: reportApi,
};
