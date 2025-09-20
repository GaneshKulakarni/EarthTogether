import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4501/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for API calls
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Don't set cache-control here - let the browser handle caching
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('API Error - Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Error - No response:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Error - Request setup:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
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

// News API
export const getEnvironmentNews = async () => {
  const requestId = Math.random().toString(36).substr(2, 9);
  const url = '/news/gemini';
  
  console.log(`[${requestId}] getEnvironmentNews: Starting request to ${url}`);
  
  try {
    const timestamp = Date.now();
    console.log(`[${requestId}] Sending request with timestamp:`, timestamp);
    
    const response = await api.get(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Request-ID': requestId
      },
      params: {
        _t: timestamp
      }
    });

    console.log(`[${requestId}] Received response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    if (!response.data) {
      console.error(`[${requestId}] No data in response`);
      throw new Error('No data in response from server');
    }
    
    // Handle both {success, data} and direct array responses
    const responseData = response.data;
    let newsData = [];
    
    if (responseData.success !== undefined) {
      // Format: {success: true, data: [...]}
      if (!responseData.success) {
        throw new Error(responseData.message || 'Request was not successful');
      }
      newsData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
    } else if (Array.isArray(responseData)) {
      // Format: [...]
      newsData = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Format: {data: [...]}
      newsData = responseData.data;
    } else {
      // Unknown format, try to use as is
      newsData = [responseData];
    }
    
    console.log(`[${requestId}] Processed news data:`, newsData);
    
    return {
      success: true,
      data: newsData
    };
    
  } catch (error) {
    console.error(`[${requestId}] Error in getEnvironmentNews:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : 'No response'
    });
    
    // In development, return mock data if the API call fails
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${requestId}] Using mock data due to error`);
      return {
        success: true,
        data: [
          {
            headline: "Example Environment News",
            summary: `This is a sample news item. Error: ${error.message || 'Unknown error'}`,
            source: "Local Mock Data"
          }
        ]
      };
    }
    
    // Re-throw with more context
    const errorMessage = error.response 
      ? `Server responded with ${error.response.status}: ${error.response.statusText}`
      : error.message || 'Failed to fetch news';
      
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

export default api;
