import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from './chakra-mock';

// Create a QueryClient for testing with sensible defaults
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper component for React Query testing
const QueryWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Wrapper component for React Query + Router testing
const QueryRouterWrapper = ({ children, route = '/' }) => {
  const queryClient = createTestQueryClient();
  window.history.pushState({}, 'Test page', route);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Wrapper component for React Query + Chakra + Router testing
const QueryChakraRouterWrapper = ({ children, route = '/' }) => {
  const queryClient = createTestQueryClient();
  window.history.pushState({}, 'Test page', route);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

// Simple render function without ChakraProvider for basic tests
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

// Full render function with ChakraProvider for components that need it
const renderWithProviders = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <ChakraProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ChakraProvider>
  );
};

// Export both render functions separately so tests can choose
export { renderWithProviders, renderWithRouter };

// Export the full render function as default (most components need Chakra UI)
export { renderWithProviders as render };

// Export React Query wrappers
export { QueryWrapper, QueryRouterWrapper, QueryChakraRouterWrapper, createTestQueryClient };

// Also export individual functions for convenience
export * from '@testing-library/react';

// Export mock functions for easy access
export { 
  createMockPollsQuery, 
  createMockAllPollsQuery, 
  createMockMutation,
  createMockQueryFn,
  createMockQueryFnWithSequence,
  createMockQueryFnWithErrorSequence,
  mockLocalStorage,
  mockSessionStorage,
  resetMocks,
  setupCommonMocks
} from './mocks';

// Export test helpers
export * from './test-helpers';

// Export test data factories
export * from './test-data';
