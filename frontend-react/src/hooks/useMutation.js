import { useMutation as useReactQueryMutation } from '@tanstack/react-query';
import { handleApiError } from '../services/apiService';

/**
 * Custom hook wrapper for React Query's useMutation
 * Maintains the same API as the previous custom hook
 * 
 * @param {Function} mutationFn - API function to call for the mutation
 * @param {Object} options - Additional options
 * @param {Function} options.onSuccess - Callback to run when mutation succeeds
 * @param {Function} options.onError - Callback to run when mutation fails
 * @param {string} options.errorMessage - Default error message
 * @returns {Array} - [mutate function, state object]
 */
const useMutation = (
  mutationFn,
  {
    onSuccess = null,
    onError = null,
    errorMessage = 'Operation failed'
  } = {}
) => {
  const mutation = useReactQueryMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        const processedErrorMessage = handleApiError(error, errorMessage);
        onError(processedErrorMessage, variables);
      }
    },
  });

  // Create a mutate function that returns a promise with the result
  const mutate = async (variables) => {
    try {
      const result = await mutation.mutateAsync(variables);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Create a state object that matches the previous API
  // For React Query, we need to check if there's an error and process it
  const getErrorState = () => {
    if (mutation.isError && mutation.error) {
      return handleApiError(mutation.error, errorMessage);
    }
    return null;
  };

  const state = {
    data: mutation.data,
    loading: mutation.isPending,
    error: getErrorState(),
  };

  return [mutate, state];
};

export default useMutation;
