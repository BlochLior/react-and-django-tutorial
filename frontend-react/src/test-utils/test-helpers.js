import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

// Common test helper functions

/**
 * Fill out a form with the provided data
 * @param {Object} user - userEvent instance
 * @param {Object} formData - form data to fill
 * @param {Object} options - additional options
 */
export const fillForm = async (user, formData, options = {}) => {
  const {
    questionText = formData.question_text,
    choices = formData.choices,
    pubDate = formData.pub_date,
  } = options;

  // Fill question text
  if (questionText) {
    const questionInput = screen.getByLabelText(/question text/i);
    await user.clear(questionInput);
    await user.type(questionInput, questionText);
  }

  // Fill publication date
  if (pubDate) {
    const dateInput = screen.getByLabelText(/publication date & time/i);
    await user.clear(dateInput);
    await user.type(dateInput, pubDate);
  }

  // Fill choices - find choice inputs by looking for inputs that don't have specific IDs
  if (choices && choices.length > 0) {
    // Find all input elements and filter out the ones with specific IDs (question_text, pub_date)
    const allInputs = screen.getAllByTestId('chakra-input');
    const choiceInputs = allInputs.filter(input => {
      const id = input.getAttribute('id');
      return !id || (id !== 'question_text' && id !== 'pub_date');
    });
    
    for (let i = 0; i < Math.min(choices.length, choiceInputs.length); i++) {
      const choice = choices[i];
      // Handle both choice_text format and direct string format
      const choiceText = choice.choice_text || choice;
      // Skip empty choices to avoid typing empty strings
      if (choiceText && typeof choiceText === 'string' && choiceText.trim()) {
        const choiceInput = choiceInputs[i];
        await user.clear(choiceInput);
        await user.type(choiceInput, choiceText);
      }
    }
  }
};

/**
 * Submit a form and wait for the submission to complete
 * @param {Object} user - userEvent instance
 * @param {string} buttonText - text of the submit button
 */
export const submitForm = async (user, buttonText = /create question/i) => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
  
  // Wait for any async operations to complete
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled();
  });
};

/**
 * Add choices to a form
 * @param {Object} user - userEvent instance
 * @param {number} count - number of choices to add
 */
export const addChoices = async (user, count = 1) => {
  const addButton = screen.getByRole('button', { name: /add choice/i });
  
  for (let i = 0; i < count; i++) {
    await user.click(addButton);
  }
};

/**
 * Remove choices from a form
 * @param {Object} user - userEvent instance
 * @param {number} count - number of choices to remove
 */
export const removeChoices = async (user, count = 1) => {
  const removeButtons = screen.getAllByRole('button', { name: /remove/i });
  
  for (let i = 0; i < count && i < removeButtons.length; i++) {
    await user.click(removeButtons[removeButtons.length - 1 - i]);
  }
};

/**
 * Wait for an element to appear and assert it exists
 * @param {string} text - text to search for
 * @param {Object} options - additional options for findByText
 */
export const waitForElement = async (text, options = {}) => {
  const element = await screen.findByText(text, options);
  expect(element).toBeInTheDocument();
  return element;
};

/**
 * Wait for an element to disappear
 * @param {string} text - text to search for
 */
export const waitForElementToDisappear = async (text) => {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
};

/**
 * Create a user event setup with consistent configuration
 */
export const createUserEvent = () => {
  return userEvent.setup({ delay: null });
};

/**
 * Common assertions for form elements
 */
export const assertFormElements = () => {
  expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/publication date & time/i)).toBeInTheDocument();
  // Use getAllByText for choices since there are multiple elements with "Choices" text
  const choicesElements = screen.getAllByText(/choices/i);
  expect(choicesElements.length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /add choice/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create question/i })).toBeInTheDocument();
};

/**
 * Common assertions for pagination elements
 */
export const assertPaginationElements = (currentPage, totalPages) => {
  expect(screen.getByText(`Page ${currentPage} of ${totalPages}`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
};

/**
 * Mock helper functions for common test scenarios
 */

/**
 * Create a mock polls query response
 * @param {Object} overrides - properties to override
 * @param {Function} onSuccessCallback - callback to trigger when query succeeds
 * @returns {Object} mock query response
 */
export const createMockPollsQuery = (overrides = {}, onSuccessCallback = null) => {
  const { createQuestions } = require('./test-data');
  const mockQuestions = createQuestions(3);
  
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
 * @returns {Object} mock query response
 */
export const createMockAllPollsQuery = (overrides = {}) => {
  const { createQuestions } = require('./test-data');
  const mockQuestions = createQuestions(3);
  
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
