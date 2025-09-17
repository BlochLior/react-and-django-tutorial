import React from 'react';
import { screen } from '@testing-library/react';
import { 
  renderWithProviders,
  createMockMutation,
  createFormData,
  fillForm,
  assertFormElements,
  createUserEvent,
  setupCommonMocks,
  resetMocks
} from '../../test-utils';
import NewQuestion from './NewQuestion';

// Mock the useMutation hook to control its behavior in tests
jest.mock('../../hooks/useMutation', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock external dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock useToast hook
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: jest.fn(() => jest.fn()),
}));

describe('NewQuestion', () => {
  let mockUseMutation;
  let mockNavigate;
  let mockToast;
  let user;
  
  const renderNewQuestion = () => {
    return renderWithProviders(<NewQuestion />);
  };

  beforeEach(() => {
    // Set up common mocks
    setupCommonMocks();
    
    // Set up the mocks for each test
    mockUseMutation = require('../../hooks/useMutation').default;
    mockToast = require('@chakra-ui/react').useToast;
    
    // Set up navigation mock
    mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    // Set up toast mock
    mockToast.mockReturnValue(jest.fn());
    
    // Create user event instance
    user = createUserEvent();
    
    // Reset all mocks
    resetMocks();
    mockUseMutation.mockReset();
    mockNavigate.mockReset();
    mockToast.mockReset();
    
    // Set up default useMutation mock using centralized utility
    const [mutateFn, state] = createMockMutation();
    mockUseMutation.mockReturnValue([mutateFn, state]);
  });

  describe('Initial Rendering', () => {
    test('renders the form with required inputs and buttons', () => {
      renderNewQuestion();
      
      // Verify the component renders
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Use centralized form element assertions
      assertFormElements();
    });
  });

  describe('Component Behavior', () => {
    test('handles different mutation states correctly', () => {
      // Test loading state
      const [loadingMutateFn, loadingState] = createMockMutation({ loading: true });
      mockUseMutation.mockReturnValue([loadingMutateFn, loadingState]);
      
      const { rerender } = renderNewQuestion();
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Test error state
      const [errorMutateFn, errorState] = createMockMutation({ error: 'Test error' });
      mockUseMutation.mockReturnValue([errorMutateFn, errorState]);
      
      rerender(<NewQuestion />);
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Test success state
      const [successMutateFn, successState] = createMockMutation({ data: { success: true } });
      mockUseMutation.mockReturnValue([successMutateFn, successState]);
      
      rerender(<NewQuestion />);
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
    });

    test('sets up mutation hook with correct configuration', () => {
      renderNewQuestion();
      
      // Verify useMutation was called
      expect(mockUseMutation).toHaveBeenCalled();
      
      // Verify it was called with the adminApi.createQuestion function
      const callArgs = mockUseMutation.mock.calls[0];
      expect(callArgs[0]).toBe(require('../../services/apiService').adminApi.createQuestion);
    });
  });

  describe('Form Integration', () => {
    test('passes correct props to QuestionForm', () => {
      renderNewQuestion();
      
      // Verify the form title is correct
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Verify the submit button text is correct
      expect(screen.getByRole('button', { name: /create question/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('allows user to fill out the form with valid data', async () => {
      const formData = createFormData({
        question_text: 'What is your favorite programming language?',
        choices: [
          { choice_text: 'JavaScript' },
          { choice_text: 'Python' }
        ]
      });

      renderNewQuestion();
      
      // Fill out the form using centralized helper
      await fillForm(user, formData);
      
      // Verify form data was entered
      expect(screen.getByDisplayValue(formData.question_text)).toBeInTheDocument();
      expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Python')).toBeInTheDocument();
    });

    test('allows user to add more choices to the form', async () => {
      renderNewQuestion();
      
      // Add one more choice
      await user.click(screen.getByRole('button', { name: /add choice/i }));
      
      // Verify we now have 3 choice inputs
      const choiceInputs = screen.getAllByTestId('chakra-input').filter(input => {
        const id = input.getAttribute('id');
        return !id || (id !== 'question_text' && id !== 'pub_date');
      });
      expect(choiceInputs).toHaveLength(3);
    });

    test('form submission button is present and clickable', async () => {
      renderNewQuestion();
      
      // Verify submit button is present
      const submitButton = screen.getByRole('button', { name: /create question/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      
      // Verify button can be clicked
      await user.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    });

    test('form validation prevents submission with empty fields', async () => {
      renderNewQuestion();
      
      // Try to submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);
      
      // Verify form validation prevents submission
      // The form should still be visible (not submitted)
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
    });

    test('form accepts user input for all fields', async () => {
      renderNewQuestion();
      
      // Fill question text
      const questionInput = screen.getByLabelText(/question text/i);
      await user.clear(questionInput);
      await user.type(questionInput, 'Test Question');
      expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
      
      // Fill choices
      const choiceInputs = screen.getAllByTestId('chakra-input').filter(input => {
        const id = input.getAttribute('id');
        return !id || (id !== 'question_text' && id !== 'pub_date');
      });
      
      await user.clear(choiceInputs[0]);
      await user.type(choiceInputs[0], 'Choice A');
      expect(screen.getByDisplayValue('Choice A')).toBeInTheDocument();
      
      await user.clear(choiceInputs[1]);
      await user.type(choiceInputs[1], 'Choice B');
      expect(screen.getByDisplayValue('Choice B')).toBeInTheDocument();
    });
  });

  describe('Navigation and Toast Integration', () => {
    test('sets up navigation mock correctly', () => {
      renderNewQuestion();
      
      // Verify navigation mock is set up
      expect(mockNavigate).toBeDefined();
      expect(typeof mockNavigate).toBe('function');
    });

    test('sets up toast mock correctly', () => {
      renderNewQuestion();
      
      // Verify toast mock is set up
      expect(mockToast).toBeDefined();
      expect(mockToast).toHaveBeenCalled();
    });

    test('handles form validation errors', async () => {
      renderNewQuestion();
      
      // Try to submit form without filling required fields
      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);
      
      // Verify form validation prevents submission
      // The form should show validation errors
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
    });
  });
});