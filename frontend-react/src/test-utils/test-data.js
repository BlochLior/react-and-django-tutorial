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
};
