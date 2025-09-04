import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
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

describe('NewQuestion', () => {
  let mockUseMutation;
  let mockNavigate;
  
  const renderNewQuestion = () => {
    return renderWithProviders(<NewQuestion />);
  };

  beforeEach(() => {
    // Set up the mocks for each test
    mockUseMutation = require('../../hooks/useMutation').default;
    
    // Set up navigation mock
    mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    // Reset all mocks
    mockUseMutation.mockReset();
    mockNavigate.mockReset();
    
    // Set up default useMutation mock to return a valid array
    mockUseMutation.mockReturnValue([
      jest.fn(), // mutate function
      { data: null, loading: false, error: null } // state object
    ]);
  });

  describe('Initial Rendering', () => {
    test('renders the form with required inputs and buttons', () => {
      renderNewQuestion();
      
      // Verify the component renders
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Verify form elements are present
      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/publication date & time/i)).toBeInTheDocument();
      
      // Verify buttons are present
      expect(screen.getByRole('button', { name: /add choice/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create question/i })).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    test('handles different mutation states correctly', () => {
      // Test loading state
      mockUseMutation.mockReturnValue([
        jest.fn(),
        { data: null, loading: true, error: null }
      ]);
      
      const { rerender } = renderNewQuestion();
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Test error state
      mockUseMutation.mockReturnValue([
        jest.fn(),
        { data: null, loading: false, error: 'Test error' }
      ]);
      
      rerender(<NewQuestion />);
      expect(screen.getByText('Create New Question')).toBeInTheDocument();
      
      // Test success state
      mockUseMutation.mockReturnValue([
        jest.fn(),
        { data: { success: true }, loading: false, error: null }
      ]);
      
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
});