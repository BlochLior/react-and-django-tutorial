import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { createFormData } from './test-data';

// Common test helper functions

/**
 * Fill out a form with the provided data
 * @param {Object} user - userEvent instance
 * @param {Object} formData - form data to fill (can be from createFormData or custom object)
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
      // Handle both choice_text format and direct string format for backward compatibility
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
 * Fill out a form using standardized test data
 * @param {Object} user - userEvent instance
 * @param {Object} overrides - data to override in the default form data
 */
export const fillFormWithTestData = async (user, overrides = {}) => {
  const formData = createFormData(overrides);
  await fillForm(user, formData);
};

/**
 * Submit a form and wait for the submission to complete
 * @param {Object} user - userEvent instance
 * @param {string|RegExp} buttonText - text of the submit button (defaults to create question)
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
 * Submit an edit form and wait for the submission to complete
 * @param {Object} user - userEvent instance
 */
export const submitEditForm = async (user) => {
  return submitForm(user, /save changes/i);
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
 * Common assertions for form elements (create form)
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
 * Common assertions for edit form elements
 */
export const assertEditFormElements = () => {
  expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/publication date & time/i)).toBeInTheDocument();
  // Use getAllByText for choices since there are multiple elements with "Choices" text
  const choicesElements = screen.getAllByText(/choices/i);
  expect(choicesElements.length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /add choice/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
};

/**
 * Common assertions for pagination elements
 */
export const assertPaginationElements = (currentPage, totalPages) => {
  expect(screen.getByText(`Page ${currentPage} of ${totalPages}`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
};

// Note: Mock query functions have been moved to mocks.js for better separation of concerns
// Import them from './mocks' if needed in your tests
