import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
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
    }
    
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
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
    localStorage.removeItem('token');
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
