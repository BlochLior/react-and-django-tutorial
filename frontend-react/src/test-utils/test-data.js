// Test data factories for consistent mock data across all tests

export const createQuestion = (overrides = {}) => ({
  id: 1,
  question_text: 'What is your favorite color?',
  pub_date: '2025-08-12T10:30:00.000Z',
  choices: [
    { id: 101, choice_text: 'Red', votes: 0 },
    { id: 102, choice_text: 'Blue', votes: 0 },
  ],
  ...overrides,
});

export const createQuestions = (count = 2, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    createQuestion({
      id: index + 1,
      question_text: `Question ${index + 1}`,
      choices: [
        { id: (index + 1) * 100 + 1, choice_text: `Choice A for Q${index + 1}`, votes: 0 },
        { id: (index + 1) * 100 + 2, choice_text: `Choice B for Q${index + 1}`, votes: 0 },
      ],
      ...overrides, // Allow overrides to be applied to each question
    })
  );
};

export const createChoice = (overrides = {}) => ({
  id: 1,
  choice_text: 'Sample Choice',
  votes: 0,
  ...overrides,
});

export const createSelectedAnswers = (questionIds = [1, 2]) => {
  return questionIds.reduce((acc, questionId) => {
    acc[questionId] = questionId * 100 + 1; // Default to first choice
    return acc;
  }, {});
};

export const createFormData = (overrides = {}) => ({
  question_text: 'New Test Question',
  pub_date: '2025-08-12T10:30:00.000Z',
  choices: [
    { choice_text: 'Choice A' },
    { choice_text: 'Choice B' },
  ],
  ...overrides,
});

// Mutation test data factories
export const createMutationData = (overrides = {}) => ({
  id: 1,
  name: 'Test',
  success: true,
  ...overrides,
});

export const createMutationError = (overrides = {}) => ({
  message: 'Network Error',
  ...overrides,
});

export const createMutationVariables = (overrides = {}) => ({
  name: 'Test',
  ...overrides,
});

// Common test scenarios
export const TEST_SCENARIOS = {
  SINGLE_QUESTION: {
    questions: [createQuestion()],
    selectedAnswers: createSelectedAnswers([1]),
  },
  MULTIPLE_QUESTIONS: {
    questions: createQuestions(3),
    selectedAnswers: createSelectedAnswers([1, 2, 3]),
  },
  INCOMPLETE_ANSWERS: {
    questions: createQuestions(2),
    selectedAnswers: { 1: 101 }, // Only first question answered
  },
  EMPTY_CHOICES: {
    questions: [createQuestion({ choices: [] })],
    selectedAnswers: {},
  },
  MUTATION_SUCCESS: {
    data: createMutationData(),
    variables: createMutationVariables(),
  },
  MUTATION_ERROR: {
    error: createMutationError(),
    variables: createMutationVariables(),
  },
  MUTATION_LOADING: {
    loading: true,
    variables: createMutationVariables(),
  },
  // useQuery specific test scenarios
  QUERY_SUCCESS: {
    data: { id: 1, name: 'Test Query Data' },
    loading: false,
    error: null,
  },
  QUERY_ERROR: {
    data: undefined,
    loading: false,
    error: 'Network Error',
  },
  QUERY_LOADING: {
    data: undefined,
    loading: true,
    error: null,
  },
  QUERY_CUSTOM_ERROR: {
    data: undefined,
    loading: false,
    error: 'Custom error message',
  },
  // ErrorState specific test scenarios
  ERROR_STATE_BASIC: {
    message: 'Something went wrong!',
    title: null,
    status: 'error',
    variant: 'subtle',
  },
  ERROR_STATE_WITH_TITLE: {
    message: 'Network connection failed',
    title: 'Connection Error',
    status: 'error',
    variant: 'subtle',
  },
  ERROR_STATE_WARNING: {
    message: 'This is a warning message',
    title: 'Warning',
    status: 'warning',
    variant: 'subtle',
  },
  ERROR_STATE_INFO: {
    message: 'This is an info message',
    title: 'Information',
    status: 'info',
    variant: 'solid',
  },
  ERROR_STATE_SUCCESS: {
    message: 'Operation completed successfully',
    title: 'Success',
    status: 'success',
    variant: 'left-accent',
  },
  ERROR_STATE_EMPTY: {
    message: '',
    title: null,
    status: 'error',
    variant: 'subtle',
  },
  ERROR_STATE_NULL: {
    message: null,
    title: null,
    status: 'error',
    variant: 'subtle',
  },
  ERROR_STATE_UNDEFINED: {
    message: undefined,
    title: null,
    status: 'error',
    variant: 'subtle',
  },
  // LoadingState specific test scenarios
  LOADING_STATE_DEFAULT: {
    message: 'Loading...',
    spinnerSize: 'xl',
    spinnerColor: 'teal.500',
    spinnerThickness: '4px',
  },
  LOADING_STATE_CUSTOM_MESSAGE: {
    message: 'Please wait while we fetch your data...',
    spinnerSize: 'xl',
    spinnerColor: 'teal.500',
    spinnerThickness: '4px',
  },
  LOADING_STATE_CUSTOM_SPINNER: {
    message: 'Loading...',
    spinnerSize: 'sm',
    spinnerColor: 'blue.500',
    spinnerThickness: '8px',
  },
  LOADING_STATE_ALL_CUSTOM: {
    message: 'Custom loading message',
    spinnerSize: 'lg',
    spinnerColor: 'red.500',
    spinnerThickness: '6px',
  },
  LOADING_STATE_NO_MESSAGE: {
    message: '',
    spinnerSize: 'xl',
    spinnerColor: 'teal.500',
    spinnerThickness: '4px',
  },
  LOADING_STATE_NULL_MESSAGE: {
    message: null,
    spinnerSize: 'xl',
    spinnerColor: 'teal.500',
    spinnerThickness: '4px',
  },
  LOADING_STATE_UNDEFINED_MESSAGE: {
    message: undefined,
    spinnerSize: 'xl',
    spinnerColor: 'teal.500',
    spinnerThickness: '4px',
  },
};
