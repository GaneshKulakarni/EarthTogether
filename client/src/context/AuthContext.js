import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: !!localStorage.getItem('token'),
  user: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      const newState = {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
      console.log('AuthContext: LOGIN_SUCCESS - isAuthenticated set to', newState.isAuthenticated);
      return newState;
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }

    try {
      const res = await axios.get('/api/auth/user', { timeout: 5000 });
      
      if (res.data) {
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (err) {
      // Only clear token and logout on 401 errors
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_ERROR' });
      } else {
        // For other errors (network, server), keep user logged in
        // but stop loading
        dispatch({ 
          type: 'USER_LOADED', 
          payload: { 
            id: 'temp', 
            username: 'User', 
            email: 'user@example.com',
            ecoPoints: 0,
            currentStreak: 0
          } 
        });
      }
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        });
        
        // Set user data from login response
        if (res.data.user) {
          dispatch({
            type: 'USER_LOADED',
            payload: res.data.user
          });
        }
      }
      
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL' });
      const serverErrors = err.response?.data?.errors;
      const message = serverErrors 
        ? serverErrors.map(e => e.msg).join(', ') 
        : (err.response?.data?.message || 'Login failed. Please check your credentials.');
      return { success: false, error: message };
    }
  };

  // Register user
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      
      // Store the token in localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });
      
      // Set user data from register response
      if (res.data.user) {
        dispatch({
          type: 'USER_LOADED',
          payload: res.data.user
        });
      }
      
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      dispatch({ type: 'LOGIN_FAIL' });
      const serverErrors = err.response?.data?.errors;
      const message = serverErrors 
        ? serverErrors.map(e => `${e.param ? e.param + ': ' : ''}${e.msg}`).join(', ') 
        : (err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, error: message };
    }
  };

  // Update user data
  const updateUser = (userData) => {
    dispatch({
      type: 'USER_LOADED',
      payload: { ...state.user, ...userData }
    });
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  // Create the context value
  const contextValue = {
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    user: state.user,
    login,
    register,
    logout,
    loadUser,
    updateUser
  };

  // console.log('AuthContext value:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
