import { useQuery as useReactQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { handleApiError } from '../services/apiService';

// Handles read operations from the API

/**
 * Custom hook wrapper for React Query's useQuery
 * Maintains the same API as the previous custom hook
 * 
 * @param {Function} queryFn - API function to fetch data
 * @param {Array} dependencies - Dependencies array to control when the query should run
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether the query should run (default: true)
 * @param {Function} options.onSuccess - Callback to run when query succeeds
 * @param {Function} options.onError - Callback to run when query fails
 * @param {string} options.errorMessage - Default error message
 * @returns {Object} - Query state and refetch function
 */
const useQuery = (
  queryFn,
  dependencies = [],
  {
    enabled = true,
    onSuccess = null,
    onError = null,
    errorMessage = 'Failed to fetch data'
  } = {}
) => {
  // Create a unique key for React Query based on the function and dependencies
  // Include function reference to trigger re-runs when function changes
  // Use a more reliable approach by including function name or a hash
  const queryKey = ['query', queryFn.name || queryFn.toString().slice(0, 50), dependencies.length, ...dependencies];
  
  const query = useReactQuery({
    queryKey,
    queryFn,
    enabled,
  });

  // Use useEffect to trigger callbacks when data or error changes
  useEffect(() => {
    if (query.data && onSuccess) {
      onSuccess(query.data);
    }
  }, [query.data, onSuccess]);

  useEffect(() => {
    if (query.error && onError) {
      const processedErrorMessage = handleApiError(query.error, errorMessage);
      onError(processedErrorMessage);
    }
  }, [query.error, onError, errorMessage]);

  // Create a state object that matches the previous API
  // Only process error in the state object, not in callbacks to avoid conflicts
  const getErrorState = () => {
    if (query.error !== undefined && query.error !== null) {
      return handleApiError(query.error, errorMessage);
    }
    return null;
  };

  const state = {
    data: query.data,
    loading: query.isLoading,
    error: getErrorState(),
    refetch: query.refetch,
  };

  return state;
};

export default useQuery;
