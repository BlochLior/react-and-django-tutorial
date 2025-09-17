import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { 
  QueryWrapper, 
  createMutationData, 
  createMutationVariables,
  waitForUseMutationReady
} from '../test-utils';
import useMutation from './useMutation';

describe('useMutation', () => {
  let mockMutationFn;
  let mockOnSuccess;
  let mockOnError;

  beforeEach(() => {
    cleanup(); // Ensure clean DOM between tests
    mockMutationFn = jest.fn();
    mockOnSuccess = jest.fn();
    mockOnError = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Custom API - Array return format', () => {
    test('should return [mutate, state] array instead of React Query object', async () => {
      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);
      
      // Verify custom API format
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      
      const [mutate, state] = result.current;
      expect(typeof mutate).toBe('function');
      expect(typeof state).toBe('object');
      expect(state).toHaveProperty('data');
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('error');
    });

    test('should map React Query state to custom format', async () => {
      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);
      
      const [, state] = result.current;
      
      // Verify custom state mapping
      expect(state.loading).toBe(false); // isPending -> loading
      expect(state.data).toBe(undefined);
      expect(state.error).toBe(null);
    });
  });

  describe('Custom error processing', () => {
    test('should process errors through handleApiError with custom error message', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      const customErrorMessage = 'Custom error message';
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        useMutation(mockMutationFn, { 
          onError: mockOnError,
          errorMessage: customErrorMessage 
        }), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      await act(async () => {
        try {
          await result.current[0](variables);
        } catch (error) {
          // Expected to throw
        }
      });

      // Verify that onError callback receives processed error message
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Network Error', variables);
      });
    });

    test('should use default error message when none provided', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        useMutation(mockMutationFn, { onError: mockOnError }), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      await act(async () => {
        try {
          await result.current[0](variables);
        } catch (error) {
          // Expected to throw
        }
      });

      // Should use default error message 'Operation failed'
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Network Error', variables);
      });
    });
  });

  describe('Custom callback parameter handling', () => {
    test('should pass only data and variables to onSuccess callback (not context)', async () => {
      const mockData = createMutationData();
      const variables = createMutationVariables();
      mockMutationFn.mockResolvedValue(mockData);

      const { result } = renderHook(() => 
        useMutation(mockMutationFn, { onSuccess: mockOnSuccess }), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      await act(async () => {
        await result.current[0](variables);
      });

      // Verify callback receives only data and variables (not context)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData, variables);
      // Should NOT be called with context as third parameter
    });

    test('should pass only processed error and variables to onError callback (not context)', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        useMutation(mockMutationFn, { onError: mockOnError }), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      await act(async () => {
        try {
          await result.current[0](variables);
        } catch (error) {
          // Expected to throw
        }
      });

      // Verify callback receives only processed error and variables (not context)
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledTimes(1);
      });
      expect(mockOnError).toHaveBeenCalledWith('Network Error', variables);
      // Should NOT be called with context as third parameter
    });
  });

  describe('Promise-based mutate function', () => {
    test('should return a promise that resolves with mutation result', async () => {
      const mockData = createMutationData();
      const variables = createMutationVariables();
      mockMutationFn.mockResolvedValue(mockData);

      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      const [mutate] = result.current;
      
      // Test that mutate function returns a promise
      const mutationPromise = mutate(variables);
      expect(mutationPromise).toBeInstanceOf(Promise);
      
      const resultData = await mutationPromise;
      expect(resultData).toEqual(mockData);
    });

    test('should return a promise that rejects with error', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      const [mutate] = result.current;
      
      // Test that mutate function returns a promise that rejects
      const mutationPromise = mutate(variables);
      expect(mutationPromise).toBeInstanceOf(Promise);
      
      await expect(mutationPromise).rejects.toThrow('Network Error');
    });
  });

  describe('Custom state error handling', () => {
    test('should process error state through handleApiError', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      const customErrorMessage = 'Custom error message';
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => 
        useMutation(mockMutationFn, { errorMessage: customErrorMessage }), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      await act(async () => {
        try {
          await result.current[0](variables);
        } catch (error) {
          // Expected to throw
        }
      });

      // Wait for error state to be processed
      await waitFor(() => {
        const [, state] = result.current;
        expect(state.error).toBe('Network Error'); // Processed by handleApiError
      });
    });

    test('should return null for error state when no error', async () => {
      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);
      
      const [, state] = result.current;
      expect(state.error).toBe(null);
    });
  });

  describe('Edge cases for custom features', () => {
    test('should handle missing onSuccess callback gracefully', async () => {
      const mockData = createMutationData();
      const variables = createMutationVariables();
      mockMutationFn.mockResolvedValue(mockData);

      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      // Should not throw when onSuccess is null/undefined
      const mutationResult = await result.current[0](variables);
      expect(mutationResult).toEqual(mockData);
    });

    test('should handle missing onError callback gracefully', async () => {
      const mockError = new Error('Network Error');
      const variables = createMutationVariables();
      mockMutationFn.mockRejectedValue(mockError);

      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);

      // Should not throw when onError is null/undefined
      await expect(async () => {
        await result.current[0](variables);
      }).rejects.toThrow('Network Error');
    });

    test('should maintain custom API format throughout hook lifecycle', async () => {
      const mockData = createMutationData();
      const variables = createMutationVariables();
      mockMutationFn.mockResolvedValue(mockData);

      const { result } = renderHook(() => useMutation(mockMutationFn), {
        wrapper: QueryWrapper,
      });

      await waitForUseMutationReady(result);
      
      // Verify format before mutation
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      
      await act(async () => {
        await result.current[0](variables);
      });
      
      // Wait for state to update after mutation
      await waitFor(() => {
        const [, state] = result.current;
        expect(state.data).toEqual(mockData);
      });
      
      // Verify format after mutation
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
    });
  });
});
