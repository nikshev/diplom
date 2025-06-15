import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { authApi } from '../services/api';
import { AUTH_TOKEN_KEY } from '../config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(AUTH_TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    if (token && typeof token === 'string' && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // Set user from token
          setCurrentUser({
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else if (token) {
      // Token exists but is invalid format, clear it
      logout();
    }
    
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      
      const data = response.data;
      
      // Save token to localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setToken(data.token);
      
      // Set current user
      setCurrentUser(data.user);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
