import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { createFormData } from './test-data';
import usePageTitle from '../hooks/usePageTitle';

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

/**
 * Common assertions for AdminQuestionCard component structure
 */
export const assertAdminQuestionCardElements = (question) => {
  // Check main card structure
  expect(screen.getByTestId('chakra-card')).toBeInTheDocument();
  expect(screen.getByTestId('chakra-cardbody')).toBeInTheDocument();
  expect(screen.getByTestId('chakra-cardfooter')).toBeInTheDocument();
  
  // Check question content
  expect(screen.getByText(question.question_text)).toBeInTheDocument();
  expect(screen.getByText(`Choices: ${question.choices?.length || 0}`)).toBeInTheDocument();
  expect(screen.getByText(`ID: ${question.id}`)).toBeInTheDocument();
  
  // Check edit button
  const editButton = screen.getByRole('link', { name: /edit question/i });
  expect(editButton).toBeInTheDocument();
  expect(editButton).toHaveAttribute('data-to', `/admin/questions/${question.id}`);
  expect(editButton).toHaveAttribute('data-colorscheme', 'teal');
  expect(editButton).toHaveAttribute('data-variant', 'outline');
};

/**
 * Common assertions for AdminQuestionList component structure
 */
export const assertAdminQuestionListElements = (expectedCount) => {
  // Check main container
  const container = screen.getByTestId('admin-question-list');
  expect(container).toBeInTheDocument();
  
  // Check correct number of question cards
  const questionCards = screen.getAllByTestId(/admin-card-/);
  expect(questionCards).toHaveLength(expectedCount);
  
  return { container, questionCards };
};

/**
 * Assert that AdminQuestionList shows empty state
 */
export const assertAdminQuestionListEmptyState = () => {
  expect(screen.getByText('No questions available')).toBeInTheDocument();
  expect(screen.getByText('Create your first question to get started!')).toBeInTheDocument();
  expect(screen.getByTestId('icon-fa-info-circle')).toBeInTheDocument();
  
  // Should not have any question cards
  expect(screen.queryByTestId(/admin-card-/)).not.toBeInTheDocument();
};

/**
 * Assert that AdminQuestionList renders question cards correctly
 */
export const assertAdminQuestionListCards = (questions) => {
  questions.forEach(question => {
    expect(screen.getByTestId(`admin-card-${question.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`question-text-${question.id}`)).toHaveTextContent(question.question_text);
    expect(screen.getByTestId(`question-id-${question.id}`)).toHaveTextContent(`ID: ${question.id}`);
  });
};

/**
 * Common assertions for QuestionCard component structure
 */
export const assertQuestionCardElements = (question) => {
  // Check main card structure
  expect(screen.getByTestId('chakra-card')).toBeInTheDocument();
  expect(screen.getByTestId('chakra-cardbody')).toBeInTheDocument();
  
  // Check question content
  expect(screen.getByText(question.question_text)).toBeInTheDocument();
  
  // Check that all choices are rendered
  const radioButtons = screen.getAllByTestId('chakra-radio');
  expect(radioButtons).toHaveLength(question.choices.length);
  
  // Check that all choice texts are displayed
  question.choices.forEach(choice => {
    expect(screen.getByText(choice.choice_text)).toBeInTheDocument();
  });
};

/**
 * Assert that QuestionCard correctly highlights the selected choice
 */
export const assertQuestionCardSelectedChoice = (selectedChoiceId) => {
  const radioGroup = screen.getByTestId('chakra-radiogroup');
  expect(radioGroup).toHaveAttribute('data-value', String(selectedChoiceId));
};

/**
 * Assert that QuestionCard calls onAnswerChange with correct parameters when choice is selected
 */
export const assertQuestionCardAnswerChange = (mockOnAnswerChange, questionId, expectedChoiceId) => {
  expect(mockOnAnswerChange).toHaveBeenCalledWith(questionId, expectedChoiceId);
};

/**
 * Common assertions for QuestionList component structure
 */
export const assertQuestionListElements = (expectedCount) => {
  // Check main container
  const container = screen.getByTestId('question-list');
  expect(container).toBeInTheDocument();
  
  // Check correct number of question cards
  const questionCards = screen.getAllByTestId(/question-card-/);
  expect(questionCards).toHaveLength(expectedCount);
  
  return { container, questionCards };
};

/**
 * Assert that QuestionList shows empty state
 */
export const assertQuestionListEmptyState = () => {
  expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  expect(screen.getByText('Check back later for new polls!')).toBeInTheDocument();
  
  // Should not have the main container when empty
  expect(screen.queryByTestId('question-list')).not.toBeInTheDocument();
};

/**
 * Assert that QuestionList renders question cards correctly
 */
export const assertQuestionListCards = (questions) => {
  questions.forEach(question => {
    expect(screen.getByTestId(`question-card-${question.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`question-text-${question.id}`)).toHaveTextContent(question.question_text);
    expect(screen.getByTestId(`question-choices-${question.id}`)).toHaveTextContent(`${question.choices.length} choices`);
  });
};

/**
 * Assert that QuestionList handles different data states correctly
 */
export const assertQuestionListDataStates = () => {
  // Test empty array
  expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  
  // Test null
  expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  
  // Test undefined
  expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
};

/**
 * Wait for useMutation hook to be ready
 */
export const waitForUseMutationReady = async (result) => {
  await waitFor(() => {
    expect(result.current).toBeDefined();
  });
  await waitFor(() => {
    expect(Array.isArray(result.current)).toBe(true);
  });
};

/**
 * Assert that document title is set to expected value
 * @param {string} expectedTitle - expected title value
 */
export const assertPageTitle = (expectedTitle) => {
  expect(document.title).toBe(expectedTitle);
};

/**
 * Assert that usePageTitle hook sets and restores title correctly
 * @param {Function} renderHook - renderHook function from @testing-library/react
 * @param {string} testTitle - title to set during test
 * @param {string} originalTitle - original title to restore to
 */
export const assertPageTitleRestoration = (renderHook, testTitle, originalTitle) => {
  const { unmount } = renderHook(() => usePageTitle(testTitle));
  
  // Title should be set during hook execution
  assertPageTitle(testTitle);
  
  // Title should be restored after unmount
  unmount();
  assertPageTitle(originalTitle);
};

/**
 * Assert that multiple usePageTitle hooks handle title precedence correctly
 * @param {Function} renderHook - renderHook function from @testing-library/react
 * @param {string} title1 - first title
 * @param {string} title2 - second title
 * @param {string} originalTitle - original title to restore to
 */
export const assertMultiplePageTitleHandling = (renderHook, title1, title2, originalTitle) => {
  const { unmount: unmount1 } = renderHook(() => usePageTitle(title1));
  const { unmount: unmount2 } = renderHook(() => usePageTitle(title2));
  
  // Last hook should win
  assertPageTitle(title2);
  
  // Unmount second hook - should restore to first title
  unmount2();
  assertPageTitle(title1);
  
  // Unmount first hook - should restore to original title
  unmount1();
  assertPageTitle(originalTitle);
};

/**
 * Assert that usePageTitle handles non-string values correctly
 * @param {Function} renderHook - renderHook function from @testing-library/react
 * @param {*} value - non-string value to test
 * @param {string} expectedString - expected string representation
 */
export const assertPageTitleTypeCoercion = (renderHook, value, expectedString) => {
  renderHook(() => usePageTitle(value));
  assertPageTitle(expectedString);
};

/**
 * Assert that useQuery hook returns expected initial state
 * @param {Object} result - result from renderHook
 * @param {*} expectedData - expected data value
 * @param {boolean} expectedLoading - expected loading state
 * @param {string|null} expectedError - expected error value
 */
export const assertUseQueryInitialState = (result, expectedData, expectedLoading = false, expectedError = null) => {
  expect(result.current.data).toEqual(expectedData);
  expect(result.current.loading).toBe(expectedLoading);
  expect(result.current.error).toBe(expectedError);
  expect(typeof result.current.refetch).toBe('function');
};

/**
 * Assert that useQuery hook handles success state correctly
 * @param {Object} result - result from renderHook
 * @param {*} expectedData - expected data value
 * @param {Function} mockOnSuccess - mock onSuccess callback
 */
export const assertUseQuerySuccessState = (result, expectedData, mockOnSuccess = null) => {
  expect(result.current.data).toEqual(expectedData);
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(null);
  
  if (mockOnSuccess) {
    expect(mockOnSuccess).toHaveBeenCalledWith(expectedData);
  }
};

/**
 * Assert that useQuery hook handles error state correctly
 * @param {Object} result - result from renderHook
 * @param {string} expectedError - expected error message
 * @param {Function} mockOnError - mock onError callback
 */
export const assertUseQueryErrorState = (result, expectedError, mockOnError = null) => {
  expect(result.current.data).toBe(undefined);
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe(expectedError);
  
  if (mockOnError) {
    expect(mockOnError).toHaveBeenCalledWith(expectedError);
  }
};

/**
 * Assert that useQuery hook handles custom error processing correctly
 * @param {Object} result - result from renderHook
 * @param {string} expectedError - expected processed error message
 * @param {string} customErrorMessage - custom error message used in options
 */
export const assertUseQueryCustomErrorProcessing = (result, expectedError, customErrorMessage) => {
  expect(result.current.error).toBe(expectedError);
  // Verify that custom error message was used in processing
  expect(result.current.error).not.toBe('Failed to fetch data'); // default message
};

/**
 * Assert that useQuery hook handles dependency changes correctly
 * @param {Function} mockQueryFn - mock query function
 * @param {number} expectedCallCount - expected number of calls
 * @param {Array} expectedDeps - expected dependencies passed to query function
 */
export const assertUseQueryDependencyHandling = (mockQueryFn, expectedCallCount, expectedDeps = []) => {
  expect(mockQueryFn).toHaveBeenCalledTimes(expectedCallCount);
  if (expectedDeps.length > 0) {
    expect(mockQueryFn).toHaveBeenLastCalledWith(...expectedDeps);
  }
};

/**
 * Assert that useQuery hook handles enabled state correctly
 * @param {Function} mockQueryFn - mock query function
 * @param {boolean} shouldBeCalled - whether query function should have been called
 */
export const assertUseQueryEnabledState = (mockQueryFn, shouldBeCalled) => {
  if (shouldBeCalled) {
    expect(mockQueryFn).toHaveBeenCalled();
  } else {
    expect(mockQueryFn).not.toHaveBeenCalled();
  }
};


/**
 * Wait for useQuery hook to complete and return stable state
 * @param {Object} result - result from renderHook
 * @param {Object} options - options for waiting
 * @param {number} options.timeout - timeout in milliseconds
 */
export const waitForUseQueryReady = async (result, options = {}) => {
  const { timeout = 1000 } = options;
  
  await waitFor(() => {
    expect(result.current).toBeDefined();
    expect(result.current.loading).toBe(false);
  }, { timeout });
};

// Note: Mock query functions have been moved to mocks.js for better separation of concerns
// Import them from './mocks' if needed in your tests
