// Centralized mocks for consistent testing across the application

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

