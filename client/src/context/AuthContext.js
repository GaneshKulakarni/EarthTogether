import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL from environment or default to development proxy
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
axios.defaults.withCredentials = true;

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
    const token = localStorage.getItem('token');
    console.log('loadUser called. Token:', token ? 'Exists' : 'Does not exist');

    if (token) {
      try {
        const res = await axios.get('/api/auth/user', {
          headers: {
            'x-auth-token': token
          }
        });
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
        console.log('User loaded successfully. Data:', res.data);
      } catch (err) {
        console.error('Error loading user:', err.response?.data || err.message);
        dispatch({ type: 'AUTH_ERROR' });
      }
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('Login API response:', res.data);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });
      // Removed redundant loadUser() call here
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      dispatch({ type: 'LOGIN_FAIL' });
      const serverErrors = err.response?.data?.errors;
      const message = serverErrors ? serverErrors.map(e => e.msg).join(', ') : (err.response?.data?.msg || 'Login failed');
      return { success: false, error: message };
    }
  };

  // Register user
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });
      loadUser();
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL' });
  const serverErrors = err.response?.data?.errors;
  const message = serverErrors ? serverErrors.map(e => `${e.param ? e.param + ': ' : ''}${e.msg}`).join(', ') : (err.response?.data?.msg || 'Registration failed');
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

  return (
    <AuthContext.Provider value={{
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      user: state.user,
      login,
      register,
      logout,
      loadUser
    }}>
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
