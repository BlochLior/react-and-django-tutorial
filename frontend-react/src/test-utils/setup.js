// Centralized test setup for consistent testing across the application

import { setupCommonMocks, resetMocks } from './mocks';

// Global test setup
beforeAll(() => {
  setupCommonMocks();
});

// Reset mocks before each test
beforeEach(() => {
  resetMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

