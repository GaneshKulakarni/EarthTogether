import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8450/api';

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



// News API
export const getEnvironmentNews = async () => {
  try {
    const response = await api.get('/news/gemini');
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Posts API
export const getPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/like/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const commentOnPost = async (postId, content) => {
  try {
    const response = await api.post(`/posts/comment/${postId}`, { content });
    return response.data;
  } catch (error) {
    console.error('Error commenting on post:', error);
    throw error;
  }
};

export const sharePost = async (postId) => {
  try {
    const response = await api.post(`/posts/share/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export default api;
