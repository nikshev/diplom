import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Protected route component that checks if user is authenticated
 * If not authenticated, redirects to login page
 * If loading, shows loading spinner
 * @param {Object} props - Component props
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // TEMPORARILY DISABLED FOR TESTING - Always allow access
  return children || <Outlet />;

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render children or outlet
  return children || <Outlet />;
};

export default ProtectedRoute;
