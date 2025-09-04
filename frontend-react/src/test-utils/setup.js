// Centralized test setup for consistent testing across the application

import { setupCommonMocks, resetMocks } from './mocks';
import { screen } from '@testing-library/react';

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

// Global test utilities that can be used across all test files
global.testUtils = {
  // Common test data
  createMockQuestion: (overrides = {}) => ({
    id: 1,
    question_text: 'Test Question',
    pub_date: '2025-08-12T10:30:00.000Z',
    choices: [
      { id: 1, choice_text: 'Choice 1', votes: 0 },
      { id: 2, choice_text: 'Choice 2', votes: 0 },
    ],
    ...overrides,
  }),

  // Common assertions
  expectElementToBeInDocument: (text) => {
    expect(document.querySelector(`[data-testid="${text}"]`)).toBeInTheDocument();
  },

  expectElementNotToBeInDocument: (text) => {
    expect(document.querySelector(`[data-testid="${text}"]`)).not.toBeInTheDocument();
  },

  // Common user interactions
  clickButton: async (user, buttonText) => {
    const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
    await user.click(button);
  },

  fillInput: async (user, labelText, value) => {
    const input = screen.getByLabelText(new RegExp(labelText, 'i'));
    await user.clear(input);
    await user.type(input, value);
  },
};
