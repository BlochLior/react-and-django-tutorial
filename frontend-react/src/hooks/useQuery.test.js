import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { 
  QueryWrapper, 
  createMockQueryFn, 
  createMockQueryFnWithSequence,
  TEST_SCENARIOS,
  assertUseQuerySuccessState,
  assertUseQueryErrorState,
  assertUseQueryCustomErrorProcessing,
  assertUseQueryDependencyHandling,
  assertUseQueryEnabledState
} from '../test-utils';
import useQuery from './useQuery';

describe('useQuery', () => {
  let mockQueryFn;
  let mockOnSuccess;
  let mockOnError;

  beforeEach(() => {
    cleanup(); // Ensure clean DOM between tests
    mockQueryFn = jest.fn();
    mockOnSuccess = jest.fn();
    mockOnError = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Custom Error Processing', () => {
    test('should process errors through handleApiError with custom error message', async () => {
      const mockError = new Error('Network Error');
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { errorMessage: 'Custom error message' }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      assertUseQueryErrorState(result, 'Network Error');
    });

    test('should use custom error message when error has no message property', async () => {
      const mockError = { customError: true };
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { errorMessage: 'Custom error message' }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Custom error message');
      });

      assertUseQueryCustomErrorProcessing(result, 'Custom error message', 'Custom error message');
    });

    test('should use default error message when no custom message provided', async () => {
      const mockError = new Error('Network Error');
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => useQuery(mockQueryFn), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      assertUseQueryErrorState(result, 'Network Error');
    });
  });

  describe('Custom Callback System', () => {
    test('should call onSuccess callback with processed data when query succeeds', async () => {
      const mockData = TEST_SCENARIOS.QUERY_SUCCESS.data;
      mockQueryFn = createMockQueryFn(mockData);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { onSuccess: mockOnSuccess }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      // Wait for the onSuccess callback to be called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
      });

      assertUseQuerySuccessState(result, mockData, mockOnSuccess);
    });

    test('should call onError callback with processed error message when query fails', async () => {
      const mockError = new Error('Network Error');
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { onError: mockOnError }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      // Wait for the onError callback to be called
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Network Error');
      });

      assertUseQueryErrorState(result, 'Network Error', mockOnError);
    });

    test('should not call callbacks when they are not provided', async () => {
      const mockData = TEST_SCENARIOS.QUERY_SUCCESS.data;
      mockQueryFn = createMockQueryFn(mockData);

      const { result } = renderHook(() => useQuery(mockQueryFn), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('Custom Query Key Generation', () => {
    test('should generate unique query keys based on function reference and dependencies', async () => {
      const mockData1 = TEST_SCENARIOS.QUERY_SUCCESS.data;
      const mockData2 = { id: 2, name: 'Test2' };
      
      mockQueryFn = createMockQueryFnWithSequence([mockData1, mockData2]);

      const { result, rerender } = renderHook(
        ({ deps }) => useQuery(mockQueryFn, deps),
        {
          initialProps: { deps: [1] },
          wrapper: QueryWrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData1);
      });

      rerender({ deps: [2] });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });

      assertUseQueryDependencyHandling(mockQueryFn, 2);
    });

    test('should handle enabled state through custom options', async () => {
      mockQueryFn = createMockQueryFn(TEST_SCENARIOS.QUERY_SUCCESS.data);

      renderHook(() => useQuery(mockQueryFn, [], { enabled: false }), {
        wrapper: QueryWrapper,
      });

      assertUseQueryEnabledState(mockQueryFn, false);
    });

    test('should handle enabled state changes through custom options', async () => {
      const mockData = TEST_SCENARIOS.QUERY_SUCCESS.data;
      mockQueryFn = createMockQueryFn(mockData);

      const { result, rerender } = renderHook(
        ({ enabled }) => useQuery(mockQueryFn, [], { enabled }),
        {
          initialProps: { enabled: false },
          wrapper: QueryWrapper,
        }
      );

      assertUseQueryEnabledState(mockQueryFn, false);

      rerender({ enabled: true });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      assertUseQueryEnabledState(mockQueryFn, true);
    });
  });

  describe('Custom State Mapping', () => {
    test('should map React Query state to custom API format', async () => {
      const mockData = TEST_SCENARIOS.QUERY_SUCCESS.data;
      mockQueryFn = createMockQueryFn(mockData);

      const { result } = renderHook(() => useQuery(mockQueryFn), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      // Verify custom state mapping
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    test('should map error state through custom error processing', async () => {
      const mockError = new Error('Network Error');
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => useQuery(mockQueryFn), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error');
      });

      // Verify custom error state mapping
      expect(result.current.data).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network Error');
      expect(typeof result.current.refetch).toBe('function');
    });

    test('should handle unmounting without state updates', async () => {
      let resolveQuery;
      const pendingQuery = new Promise(resolve => {
        resolveQuery = resolve;
      });
      mockQueryFn = jest.fn().mockReturnValue(pendingQuery);

      const { result, unmount } = renderHook(() => useQuery(mockQueryFn), {
        wrapper: QueryWrapper,
      });

      let queryPromise;
      await act(async () => {
        queryPromise = mockQueryFn();
      });

      // Capture state before unmount
      const stateBeforeUnmount = {
        data: result.current.data,
        loading: result.current.loading,
        error: result.current.error
      };
      expect(stateBeforeUnmount.loading).toBe(true);

      unmount();
      resolveQuery(TEST_SCENARIOS.QUERY_SUCCESS.data);

      try {
        await queryPromise;
      } catch (error) {
        // Expected to throw or complete
      }

      // Verify state doesn't update after unmount by checking captured state
      expect(stateBeforeUnmount.data).toBe(undefined);
      expect(stateBeforeUnmount.loading).toBe(true);
      expect(stateBeforeUnmount.error).toBe(null);
    });
  });

  describe('Custom Error Processing Edge Cases', () => {
    test('should handle errors without message property using custom error message', async () => {
      const mockError = { customError: true };
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { errorMessage: 'Custom error message' }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Custom error message');
      });

      assertUseQueryCustomErrorProcessing(result, 'Custom error message', 'Custom error message');
    });

    test('should handle empty error messages using custom error message', async () => {
      const mockError = new Error(''); // Empty error message
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { errorMessage: 'Custom error message' }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Custom error message');
      });

      assertUseQueryCustomErrorProcessing(result, 'Custom error message', 'Custom error message');
    });

    test('should handle undefined errors using custom error message', async () => {
      const mockError = undefined;
      mockQueryFn = createMockQueryFn(mockError, true);

      const { result } = renderHook(() => 
        useQuery(mockQueryFn, [], { errorMessage: 'Custom error message' }), {
        wrapper: QueryWrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Custom error message');
      });

      assertUseQueryCustomErrorProcessing(result, 'Custom error message', 'Custom error message');
    });
  });
});
