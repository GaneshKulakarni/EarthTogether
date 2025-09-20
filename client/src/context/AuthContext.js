import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Configure axios - using relative URLs that will be proxied
axios.defaults.withCredentials = true;

// Add a request interceptor to include the auth token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
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
    console.group('AuthContext - loadUser');
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    if (!token) {
      console.log('No token found, dispatching AUTH_ERROR');
      dispatch({ type: 'AUTH_ERROR' });
      console.groupEnd();
      return;
    }

    try {
      console.log('Fetching user data from /api/auth/user');
      const res = await axios.get('/api/auth/user', {
        headers: {
          'x-auth-token': token
        },
        timeout: 5000
      });
      
      console.log('User data response:', res.data ? 'Received data' : 'No data');
      
      if (res.data) {
        console.log('Dispatching USER_LOADED with payload:', res.data);
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
      } else {
        console.error('No user data received from server');
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (err) {
      console.error('Error loading user:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });
      
      // If token is invalid or expired, clear it
      if (err.response?.status === 401) {
        console.log('Token is invalid or expired, removing from storage');
        localStorage.removeItem('token');
      } else if (err.code === 'ECONNABORTED') {
        console.error('Request timed out');
        // toast.error('Connection timeout. Please check your internet connection.');
      } else if (!navigator.onLine) {
        console.error('No internet connection');
        // toast.error('No internet connection. Please check your network.');
      }
      
      dispatch({ type: 'AUTH_ERROR' });
    } finally {
      console.groupEnd();
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('Login API response:', res.data);
      
      // Store the token in localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // Load user data
      await loadUser();
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
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
      
      // Load user data
      await loadUser();
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

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    loadUser();
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
    loadUser
  };

  console.log('AuthContext value:', contextValue);

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
