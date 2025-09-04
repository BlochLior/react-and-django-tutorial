import axios from 'axios';

// Base API configuration
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// Create API instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await api.post('/polls/vote/', { votes });
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
