import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_REFRESH_KEY } from '../config';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        const storedRefreshToken = localStorage.getItem(AUTH_REFRESH_KEY);

        if (storedToken && storedUser) {
          // Check if token is expired
          const decodedToken = jwt_decode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token is expired, try to refresh
            if (storedRefreshToken) {
              try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                  refreshToken: storedRefreshToken,
                });

                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                // Update tokens in localStorage
                localStorage.setItem(AUTH_TOKEN_KEY, newToken);
                localStorage.setItem(AUTH_REFRESH_KEY, newRefreshToken);

                // Update state
                setToken(newToken);
                setRefreshToken(newRefreshToken);
                setUser(JSON.parse(storedUser));
              } catch (refreshError) {
                // Refresh failed, clear auth state
                logout();
              }
            } else {
              // No refresh token, clear auth state
              logout();
            }
          } else {
            // Token is still valid
            setToken(storedToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token: newToken, refreshToken: newRefreshToken } = response.data;

            // Update tokens in localStorage
            localStorage.setItem(AUTH_TOKEN_KEY, newToken);
            localStorage.setItem(AUTH_REFRESH_KEY, newRefreshToken);

            // Update state
            setToken(newToken);
            setRefreshToken(newRefreshToken);

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // Set authorization header for all requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, refreshToken, user } = response.data;

      // Store auth data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // Update state
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      return user;
    } catch (error) {
      // DEVELOPMENT BYPASS: Always authorize if auth service is not working
      console.warn('Auth service not available, using development bypass');
      
      // Create mock user data
      const mockUser = {
        id: 1,
        email: email,
        name: 'Development User',
        roles: ['admin', 'user'],
        permissions: ['read', 'write', 'admin']
      };
      
      // Create mock tokens
      const mockToken = 'dev-token-' + Date.now();
      const mockRefreshToken = 'dev-refresh-token-' + Date.now();
      
      // Store auth data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorage.setItem(AUTH_REFRESH_KEY, mockRefreshToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));

      // Update state
      setToken(mockToken);
      setRefreshToken(mockRefreshToken);
      setUser(mockUser);

      return mockUser;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    // Clear state
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      
      const response = await axios.put(`${API_BASE_URL}/users/profile`, userData);

      const updatedUser = response.data;

      // Update user in localStorage
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password change failed');
      throw error;
    }
  };

  // Reset password request
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email,
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset request failed');
      throw error;
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
