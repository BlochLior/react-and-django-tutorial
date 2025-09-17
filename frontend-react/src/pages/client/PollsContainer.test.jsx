import React from 'react';
import { 
  render, 
  cleanup,
  waitFor,
  screen,
  TEST_SCENARIOS,
  assertPollsContainerLoadingState,
  assertPollsContainerSuccessState,
  assertPollsContainerErrorState,
  assertPollsContainerPagination,
  QueryChakraRouterWrapper
} from '../../test-utils';
import PollsContainer from './PollsContainer';

// Mock the API service to control responses
jest.mock('../../services/apiService', () => ({
  pollsApi: {
    getPolls: jest.fn(),
    getAllPolls: jest.fn(),
    submitVotes: jest.fn(),
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

// Mock child components to isolate the test
jest.mock('../../components/client/QuestionList', () => ({ onAnswerChange }) => (
  <div data-testid="question-list">
    <button onClick={() => onAnswerChange(1, 101)}>Select Answer 1</button>
    <button onClick={() => onAnswerChange(2, 201)}>Select Answer 2</button>
  </div>
));

// Mock useNavigate to test navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Refined mock for Pagination to include buttons
jest.mock('../../components/ui/Pagination', () => ({ onPageChange, hasNext, hasPrevious, currentPage }) => (
  <div data-testid="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrevious}>previous</button>
    <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext}>next</button>
  </div>
));

// Mock the ReviewPage component to simplify testing the parent's logic
jest.mock('./ReviewPage', () => {
  return function MockReviewPage({ onSubmit }) {
    return (
      <div data-testid="review-page">
        <button onClick={onSubmit}>Submit Votes</button>
      </div>
    );
  };
});


describe('PollsContainer', () => {
  let consoleErrorSpy;
  let mockUseQuery;
  let mockUseMutation;
  
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    cleanup();
    
    // Set up the mocks for each test
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseMutation = require('../../hooks/useMutation').default;
    
    // Reset and set up default working mocks
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    
    // Default to success state
    const scenario = TEST_SCENARIOS.POLLS_CONTAINER_SUCCESS;
    mockUseQuery.mockReturnValue(scenario);
    
    const mutationScenario = TEST_SCENARIOS.POLLS_CONTAINER_MUTATION_SUCCESS;
    mockUseMutation.mockReturnValue([
      mutationScenario.mutate,
      {
        data: mutationScenario.data,
        loading: mutationScenario.loading,
        error: mutationScenario.error
      }
    ]);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderPollsContainer = () => {
    return render(<PollsContainer />, { wrapper: QueryChakraRouterWrapper });
  };

  describe('Data Loading States', () => {
    test('renders loading state initially', () => {
      const scenario = TEST_SCENARIOS.POLLS_CONTAINER_LOADING;
      mockUseQuery.mockReturnValue(scenario);
      
      renderPollsContainer();
      assertPollsContainerLoadingState();
    });

    test('renders polls after successful API fetch', async () => {
      const scenario = TEST_SCENARIOS.POLLS_CONTAINER_SUCCESS;
      
      // Mock the useQuery hook to return success state and call onSuccess callback
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        // Call the onSuccess callback asynchronously to avoid infinite loops
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(scenario.data), 0);
        }
        return scenario;
      });

      renderPollsContainer();

      // Wait for the onSuccess callback to be called
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      assertPollsContainerSuccessState(scenario.data);
    });
    
    test('renders error message on API fetch failure', () => {
      const scenario = TEST_SCENARIOS.POLLS_CONTAINER_ERROR;
      mockUseQuery.mockReturnValue(scenario);

      renderPollsContainer();
      
      assertPollsContainerErrorState(scenario.error);
    });
  });

  

  describe('Component Rendering', () => {
    test('renders pagination component with correct navigation states', async () => {
      const scenario = TEST_SCENARIOS.POLLS_CONTAINER_WITH_PAGINATION;
      
      // Mock the useQuery hook to return success state and call onSuccess callback
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        // Call the onSuccess callback asynchronously to avoid infinite loops
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(scenario.data), 0);
        }
        return scenario;
      });
      
      renderPollsContainer();
      
      // Wait for the onSuccess callback to be called
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
      
      assertPollsContainerPagination(scenario.data);
    });
  });

});
