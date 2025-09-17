// Centralized mocks for consistent testing across the application
import { createQuestions } from './test-data';

// Mock for localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock for sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup function to reset all mocks
export const resetMocks = () => {
  Object.values(mockLocalStorage).forEach(mock => mock.mockClear());
  Object.values(mockSessionStorage).forEach(mock => mock.mockClear());
};

// Setup function to configure common mock responses
export const setupCommonMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });
};

// Mock query response generators
/**
 * Create a mock polls query response
 * @param {Object} overrides - properties to override
 * @param {Function} onSuccessCallback - callback to trigger when query succeeds
 * @param {number} questionCount - number of questions to generate (default: 3)
 * @returns {Object} mock query response
 */
export const createMockPollsQuery = (overrides = {}, onSuccessCallback = null, questionCount = 3) => {
  const mockQuestions = createQuestions(questionCount);
  
  const defaultResponse = {
    data: {
      results: mockQuestions,
      page: 1,
      total_pages: 1,
      previous: null,
      next: null,
    },
    loading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue({ data: { results: mockQuestions } }),
  };
  
  const response = { ...defaultResponse, ...overrides };
  
  // If an onSuccess callback was provided and we have data, call it
  if (onSuccessCallback && response.data && !response.loading && !response.error) {
    // Simulate the onSuccess callback being called with the data
    setTimeout(() => onSuccessCallback(response.data), 0);
  }
  
  return response;
};

/**
 * Create a mock all polls query response
 * @param {Object} overrides - properties to override
 * @param {number} questionCount - number of questions to generate (default: 3)
 * @returns {Object} mock query response
 */
export const createMockAllPollsQuery = (overrides = {}, questionCount = 3) => {
  const mockQuestions = createQuestions(questionCount);
  
  const defaultResponse = {
    data: { results: mockQuestions },
    loading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue({ data: { results: mockQuestions } }),
  };
  
  return { ...defaultResponse, ...overrides };
};

/**
 * Create a mock mutation response
 * @param {Object} overrides - properties to override
 * @param {Function} onSuccessCallback - callback to trigger on successful mutation
 * @returns {Array} mock mutation response [mutateFn, state]
 */
export const createMockMutation = (overrides = {}, onSuccessCallback = null) => {
  const defaultState = { data: null, loading: false, error: null };
  
  // Create a mutate function that can trigger the onSuccess callback
  const mutateFn = jest.fn().mockImplementation(async (variables) => {
    const result = { success: true };
    
    // If an onSuccess callback was provided, call it
    if (onSuccessCallback) {
      onSuccessCallback(result, variables);
    }
    
    return result;
  });
  
  return [
    mutateFn,
    { ...defaultState, ...overrides }
  ];
};

/**
 * Create a mock query function for useQuery testing
 * @param {*} returnValue - value to return when query function is called
 * @param {boolean} shouldReject - whether the function should reject
 * @param {number} delay - delay in milliseconds before resolving/rejecting
 * @returns {Function} mock query function
 */
export const createMockQueryFn = (returnValue = { id: 1, name: 'Test' }, shouldReject = false, delay = 0) => {
  return jest.fn().mockImplementation(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldReject) {
          reject(returnValue);
        } else {
          resolve(returnValue);
        }
      }, delay);
    });
  });
};

/**
 * Create a mock query function that resolves with different values on subsequent calls
 * @param {Array} returnValues - array of values to return on each call
 * @returns {Function} mock query function
 */
export const createMockQueryFnWithSequence = (returnValues) => {
  let callCount = 0;
  return jest.fn().mockImplementation(() => {
    const value = returnValues[callCount % returnValues.length];
    callCount++;
    return Promise.resolve(value);
  });
};

/**
 * Create a mock query function that rejects with different errors on subsequent calls
 * @param {Array} errors - array of errors to reject with on each call
 * @returns {Function} mock query function
 */
export const createMockQueryFnWithErrorSequence = (errors) => {
  let callCount = 0;
  return jest.fn().mockImplementation(() => {
    const error = errors[callCount % errors.length];
    callCount++;
    return Promise.reject(error);
  });
};

