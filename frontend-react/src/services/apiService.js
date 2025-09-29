import axios from 'axios';

// Base API configuration
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create API instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Include cookies in requests for authentication
});

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  // Get CSRF token from cookies
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
});

/**
 * Polls API endpoints
 */
export const pollsApi = {
  // Get paginated polls for clients
  getPolls: async (page = 1) => {
    const response = await api.get(`/polls/?page=${page}`);
    return response.data;
  },
  
  // Get all polls for review
  getAllPolls: async () => {
    const response = await api.get('/polls/?page_size=all');
    return response.data;
  },
  
  // Submit votes
  submitVotes: async (votes) => {
    console.log('API Service: Submitting votes:', votes);
    console.log('API Service: Making POST request to /polls/vote/');
    console.log('API Service: With credentials:', true);
    console.log('API Service: Document cookies:', document.cookie);
    
    try {
      const response = await api.post('/polls/vote/', { votes });
      console.log('API Service: Vote response received:', response);
      return response.data;
    } catch (error) {
      console.log('API Service: Vote error occurred:', error);
      console.log('API Service: Error response:', error.response?.data);
      throw error;
    }
  },

  // Authentication methods
  getUserInfo: async () => {
    console.log('API Service: Making request to /auth/user-info/');
    console.log('API Service: Base URL:', API_URL);
    console.log('API Service: With credentials:', true);
    
    try {
      const response = await api.get('/auth/user-info/');
      console.log('API Service: Response received:', response);
      console.log('API Service: Response data:', response.data);
      return response;
    } catch (error) {
      console.log('API Service: Error occurred:', error);
      throw error;
    }
  },
  
  getAdminStats: async () => {
    const response = await api.get('/auth/admin-stats/');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  }
};

/**
 * Admin API endpoints
 */
export const adminApi = {
  // Get paginated questions for admin
  getQuestions: async (page = 1) => {
    const response = await api.get(`/admin/?page=${page}`);
    return response.data;
  },
  
  // Get question details by ID
  getQuestion: async (questionId) => {
    const response = await api.get(`/admin/questions/${questionId}/`);
    return response.data;
  },
  
  // Create new question
  createQuestion: async (questionData) => {
    const response = await api.post('/admin/create/', questionData);
    return response.data;
  },
  
  // Update question
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/admin/questions/${questionId}/`, questionData);
    return response.data;
  },
  
  // Delete question
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/admin/questions/${questionId}/`);
    return response.data;
  },
  
  // Get results summary
  getResultsSummary: async () => {
    const response = await api.get('/admin/summary/');
    return response.data;
  }
};

/**
 * Error handling utilities
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.log('handleApiError called with:', { error, defaultMessage });
  console.log('Error type:', typeof error);
  console.log('Error message:', error?.message);
  console.log('Error response:', error?.response);
  console.log('Error keys:', Object.keys(error || {}));
  
  // Extract the error message from the API response if available
  const errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      defaultMessage;
  
  console.log('handleApiError returning:', errorMessage);
  console.error('API Error:', error);
  return errorMessage;
};
