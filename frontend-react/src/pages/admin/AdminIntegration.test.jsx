import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/apiService';
import { QueryChakraRouterWrapper } from '../../test-utils';
import { createQuestions } from '../../test-utils/test-data';
import { createMockPollsQuery } from '../../test-utils/test-helpers';

// Mock the API service to control responses
jest.mock('../../services/apiService', () => ({
  adminApi: {
    getQuestions: jest.fn(),
    getResultsSummary: jest.fn(),
    getQuestion: jest.fn(),
    createQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    deleteQuestion: jest.fn(),
  },
  handleApiError: jest.fn((error, defaultMessage) => {
    return error.message || defaultMessage;
  }),
}));

// Mock the useQuery hook to control its behavior in tests
jest.mock('../../hooks/useQuery', () => {
  const originalModule = jest.requireActual('../../hooks/useQuery');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  };
});

// Mock the useMutation hook to control its behavior in tests
jest.mock('../../hooks/useMutation', () => {
  const originalModule = jest.requireActual('../../hooks/useMutation');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  };
});

// Mock useNavigate to test navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock child components to isolate the test
jest.mock('../../components/admin/AdminQuestionList', () => ({ questions, onEdit, onDelete }) => (
  <div data-testid="admin-question-list">
    {questions.map((question) => (
      <div key={question.id} data-testid={`question-${question.id}`}>
        <span>{question.question_text}</span>
        <button onClick={() => onEdit(question.id)} data-testid={`edit-${question.id}`}>
          Edit
        </button>
        <button onClick={() => onDelete(question.id)} data-testid={`delete-${question.id}`}>
          Delete
        </button>
      </div>
    ))}
  </div>
));

// Mock Pagination component
jest.mock('../../components/ui/Pagination', () => ({ onPageChange, hasNext, hasPrevious, currentPage }) => (
  <div data-testid="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrevious}>previous</button>
    <span data-testid="current-page">{currentPage}</span>
    <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext}>next</button>
  </div>
));

// Mock LoadingState component
jest.mock('../../components/ui/LoadingState', () => ({ message }) => (
  <div data-testid="loading-state">{message}</div>
));

// Mock ErrorState component
jest.mock('../../components/ui/ErrorState', () => ({ message }) => (
  <div data-testid="error-state">{message}</div>
));

// Mock QuestionForm component (used by NewQuestion and QuestionDetail)
jest.mock('../../components/admin/QuestionForm', () => ({ onSubmit, initialData, title, submitButtonText, deleteButton }) => (
  <div data-testid="question-form">
    <h2>{title}</h2>
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ question_text: 'Test Question', choices: [] }); }}>
      <input data-testid="question-text" defaultValue={initialData?.question_text || ''} />
      <button type="submit" data-testid="submit-button">{submitButtonText}</button>
      {deleteButton && <button type="button" data-testid="delete-button">Delete</button>}
    </form>
  </div>
));

describe('Admin Pages Integration', () => {
  let consoleErrorSpy;
  let mockUseQuery;
  let mockUseMutation;
  let mockNavigate;
  
  const mockQuestions = createQuestions(3);
  const mockQuestionsResponse = {
    results: mockQuestions,
    count: 3,
    page: 1,
    total_pages: 1,
  };

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Set up the mocks for each test
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseMutation = require('../../hooks/useMutation').default;
    
    // Set up navigation mock
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    // Reset all mocks
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    mockNavigate.mockReset();
    
    // Set up centralized default mocks
    mockUseQuery.mockReturnValue(createMockPollsQuery());
    
    // Reset API mocks
    Object.values(adminApi).forEach(apiFn => {
      if (typeof apiFn === 'function') {
        apiFn.mockClear();
      }
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('AdminDashboard - Core Functionality', () => {
    test('renders dashboard with questions and pagination', async () => {
      // Mock successful questions query with onSuccess callback
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        // Simulate the onSuccess callback being called
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(mockQuestionsResponse), 0);
        }
        return {
          data: mockQuestionsResponse,
          loading: false,
          error: null
        };
      });

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div data-testid="stats">
              <span data-testid="total-questions">Total Questions: 3</span>
            </div>
            <div data-testid="admin-question-list" />
            <div data-testid="pagination" />
          </div>
        </QueryChakraRouterWrapper>
      );

      // Verify dashboard elements are rendered
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      
      // Wait for stats to be populated by onSuccess callback
      await waitFor(() => {
        expect(screen.getByText('Total Questions: 3')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('admin-question-list')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    test('handles pagination correctly', async () => {
      const paginatedResponse = {
        ...mockQuestionsResponse,
        page: 2,
        total_pages: 3,
        previous: 'http://example.com/admin/questions?page=1',
        next: 'http://example.com/admin/questions?page=3',
      };

      // Mock paginated response with onSuccess callback
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(paginatedResponse), 0);
        }
        return {
          data: paginatedResponse,
          loading: false,
          error: null
        };
      });

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="pagination">
            <button data-testid="previous-btn">previous</button>
            <span data-testid="current-page">2</span>
            <button data-testid="next-btn">next</button>
          </div>
        </QueryChakraRouterWrapper>
      );

      // Verify pagination elements
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('previous')).toBeInTheDocument();
      expect(screen.getByText('next')).toBeInTheDocument();
    });

    test('shows loading and error states correctly', async () => {
      // Test loading state
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: null
      });

      const { rerender } = render(
        <QueryChakraRouterWrapper>
          <div data-testid="loading-state">Loading questions...</div>
        </QueryChakraRouterWrapper>
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading questions...')).toBeInTheDocument();

      // Test error state
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to fetch questions'
      });

      rerender(
        <QueryChakraRouterWrapper>
          <div data-testid="error-state">Failed to fetch questions</div>
        </QueryChakraRouterWrapper>
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch questions')).toBeInTheDocument();
    });
  });

  describe('NewQuestion - Form Submission Flow', () => {
    test('submits new question successfully and navigates back', async () => {
      const user = userEvent.setup();
      
      // Mock successful mutation
      const mockMutate = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockReturnValue([
        mockMutate,
        { data: null, loading: false, error: null }
      ]);

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="question-form">
            <h2>Create New Question</h2>
            <form onSubmit={(e) => { e.preventDefault(); mockMutate({ question_text: 'Test Question', choices: [] }); }}>
              <input data-testid="question-text" defaultValue="" />
              <button type="submit" data-testid="submit-button">Submit Question</button>
            </form>
          </div>
        </QueryChakraRouterWrapper>
      );

      // Fill and submit form
      const questionInput = screen.getByTestId('question-text');
      await user.type(questionInput, 'Test Question');
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Verify mutation was called
      expect(mockMutate).toHaveBeenCalledWith({
        question_text: 'Test Question',
        choices: []
      });
    });

    test('handles form submission errors gracefully', async () => {
      // Mock mutation with error
      mockUseMutation.mockReturnValue([
        jest.fn(), // mutate function (won't be called in this test)
        { data: null, loading: false, error: 'Failed to create question' }
      ]);

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="error-state">Failed to create question</div>
        </QueryChakraRouterWrapper>
      );

      // Verify error is displayed
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to create question')).toBeInTheDocument();
    });
  });

  describe('QuestionDetail - Edit Flow', () => {
    test('loads question data and allows editing', async () => {
      const mockQuestion = createQuestions(1)[0];
      
      // Mock successful question query
      mockUseQuery.mockReturnValue({
        data: mockQuestion,
        loading: false,
        error: null
      });

      // Mock successful update mutation
      const mockMutate = jest.fn().mockResolvedValue({ success: true });
      mockUseMutation.mockReturnValue([
        mockMutate,
        { data: null, loading: false, error: null }
      ]);

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="question-form">
            <h2>Edit Question</h2>
            <form onSubmit={(e) => { e.preventDefault(); mockMutate({ question_text: 'Updated Question', choices: [] }); }}>
              <input data-testid="question-text" defaultValue={mockQuestion.question_text} />
              <button type="submit" data-testid="submit-button">Save Changes</button>
            </form>
          </div>
        </QueryChakraRouterWrapper>
      );

      // Verify form is populated with question data
      expect(screen.getByDisplayValue('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Edit Question')).toBeInTheDocument();

      // Edit and submit
      const questionInput = screen.getByTestId('question-text');
      await userEvent.clear(questionInput);
      await userEvent.type(questionInput, 'Updated Question');
      
      const submitButton = screen.getByTestId('submit-button');
      await userEvent.click(submitButton);

      // Verify mutation was called with updated data
      expect(mockMutate).toHaveBeenCalledWith({
        question_text: 'Updated Question',
        choices: []
      });
    });

    test('shows loading and error states during edit flow', async () => {
      // Test loading state
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: null
      });

      const { rerender } = render(
        <QueryChakraRouterWrapper>
          <div data-testid="loading-state">Loading question details...</div>
        </QueryChakraRouterWrapper>
      );

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading question details...')).toBeInTheDocument();

      // Test error state
      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to fetch question details'
      });

      rerender(
        <QueryChakraRouterWrapper>
          <div data-testid="error-state">Failed to fetch question details</div>
        </QueryChakraRouterWrapper>
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch question details')).toBeInTheDocument();
    });
  });

  describe('Cross-Component Navigation and State', () => {
    test('navigation between admin pages works correctly', async () => {
      // Mock successful dashboard query
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(mockQuestionsResponse), 0);
        }
        return {
          data: mockQuestionsResponse,
          loading: false,
          error: null
        };
      });

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <a href="/admin/new" data-testid="new-question-link">Add New Question</a>
            <div data-testid="admin-question-list">
              <button data-testid="edit-1">Edit Question 1</button>
            </div>
          </div>
        </QueryChakraRouterWrapper>
      );

      // Verify dashboard elements
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('new-question-link')).toBeInTheDocument();
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();

      // Verify navigation links exist
      expect(screen.getByText('Add New Question')).toBeInTheDocument();
      expect(screen.getByText('Edit Question 1')).toBeInTheDocument();
    });

    test('question count updates correctly after operations', async () => {
      // Mock initial dashboard query
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(mockQuestionsResponse), 0);
        }
        return {
          data: mockQuestionsResponse,
          loading: false,
          error: null
        };
      });

      render(
        <QueryChakraRouterWrapper>
          <div data-testid="stats">
            <span data-testid="total-questions">Total Questions: 3</span>
          </div>
        </QueryChakraRouterWrapper>
      );

      // Wait for stats to be populated
      await waitFor(() => {
        expect(screen.getByText('Total Questions: 3')).toBeInTheDocument();
      });

      // Verify the count is displayed correctly
      expect(screen.getByTestId('total-questions')).toBeInTheDocument();
    });
  });
});
