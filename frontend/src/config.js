/**
 * Configuration for frontend application
 */

// Dynamically determine API base URL
const getApiBaseUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For production, try to use the current hostname
  if (process.env.NODE_ENV === 'production') {
    const hostname = window.location.hostname;
    return `http://34.30.203.9/api/v1`;
  }
  
  // Default to localhost for development
  return `http://34.30.203.9/api/v1`;
};

// API base URL
export const API_BASE_URL = getApiBaseUrl();

// Authentication settings
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
export const AUTH_REFRESH_KEY = 'auth_refresh';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// Date format settings
export const DATE_FORMAT = 'DD.MM.YYYY';
export const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm';

// Theme settings
export const THEME = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff4081',
    dark: '#c51162',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
};

// Module settings
export const MODULES = {
  dashboard: {
    enabled: true,
    path: '/dashboard',
  },
  orders: {
    enabled: true,
    path: '/orders',
  },
  customers: {
    enabled: true,
    path: '/customers',
  },
  inventory: {
    enabled: true,
    path: '/products',
  },
  finance: {
    enabled: true,
    path: '/finance',
  },
  analytics: {
    enabled: true,
    path: '/analytics',
  },
  reports: {
    enabled: true,
    path: '/reports',
  },
  users: {
    enabled: true,
    path: '/users',
  },
  settings: {
    enabled: true,
    path: '/settings',
  },
};

// Export default configuration
export default {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_REFRESH_KEY,
  DEFAULT_PAGE_SIZE,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  THEME,
  MODULES,
};
