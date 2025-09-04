// Centralized mocks for consistent testing across the application

// Mock for API service error handling
export const mockHandleApiError = jest.fn((error, defaultMessage) => {
  console.log('Centralized mock called with:', { error, defaultMessage });
  console.log('Error type:', typeof error);
  console.log('Error message:', error?.message);
  
  // Handle both Error objects and other error types
  const result = (error && error.message) || defaultMessage;
  console.log('Centralized mock returning:', result);
  return result;
});

// Mock for API service
export const mockApiService = {
  handleApiError: mockHandleApiError,
};

// Mock for react-router-dom navigation
export const mockNavigate = jest.fn();

// Mock for axios HTTP client
export const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

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
  mockNavigate.mockClear();
  Object.values(mockAxios).forEach(mock => mock.mockClear());
  Object.values(mockLocalStorage).forEach(mock => mock.mockClear());
  Object.values(mockSessionStorage).forEach(mock => mock.mockClear());
  mockHandleApiError.mockClear();
};

// Setup function to configure common mock responses
export const setupCommonMocks = () => {
  // Mock successful API responses
  mockAxios.post.mockResolvedValue({ status: 201, data: { id: 1 } });
  mockAxios.get.mockResolvedValue({ status: 200, data: [] });
  mockAxios.put.mockResolvedValue({ status: 200, data: { id: 1 } });
  mockAxios.delete.mockResolvedValue({ status: 204 });
  
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

// Mock component for testing purposes
export const MockComponent = ({ children, ...props }) => (
  <div data-testid="mock-component" {...props}>
    {children}
  </div>
);

// Mock function for event handlers
export const createMockHandler = (returnValue = undefined) => 
  jest.fn().mockReturnValue(returnValue);

// Mock for timers
export const setupTimers = () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-08-12T10:30:00.000Z'));
};

export const cleanupTimers = () => {
  jest.useRealTimers();
  jest.clearAllTimers();
};
