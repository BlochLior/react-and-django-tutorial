import React from 'react';
import { 
  render, 
  cleanup,
  TEST_SCENARIOS,
  assertResultsSummaryLoadingState,
  assertResultsSummarySuccessState,
  assertResultsSummaryErrorState,
  assertResultsSummaryEmptyState,
  assertResultsSummaryQuestionResults,
  QueryChakraRouterWrapper
} from '../../test-utils';
import ResultsSummary from './ResultsSummary';

// Mock the useQuery hook to control its behavior in tests
jest.mock('../../hooks/useQuery', () => {
  const originalModule = jest.requireActual('../../hooks/useQuery');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  };
});

// Mock the usePageTitle hook
jest.mock('../../hooks/usePageTitle', () => jest.fn());

// Mock LoadingState component
jest.mock('../../components/ui/LoadingState', () => ({ message }) => (
  <div data-testid="loading-state">{message}</div>
));

// Mock ErrorState component
jest.mock('../../components/ui/ErrorState', () => ({ message }) => (
  <div data-testid="error-state">{message}</div>
));

// Mock utility functions - complete implementation to avoid dependency issues
jest.mock('../../utils/dateUtils', () => ({
  isPublicationDateFuture: () => false,
  formatPublicationDate: () => '2025-08-12'
}));

jest.mock('../../utils/questionUtils', () => ({
  hasQuestionChoices: (question) => question.choices && question.choices.length > 0,
  calculateVotePercentage: (votes, totalVotes) => totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
  getQuestionType: (question) => {
    const hasChoices = question.choices && question.choices.length > 0;
    const isFuturePublication = false; // Always false in our mock
    
    if (hasChoices) {
      return isFuturePublication ? 'future_with_choices' : 'published_with_votes';
    } else {
      return isFuturePublication ? 'future_choiceless' : 'published_choiceless';
    }
  },
  categorizeQuestions: (questions) => {
    const publishedWithVotes = [];
    const futureWithChoices = [];
    const publishedChoiceless = [];
    const futureChoiceless = [];

    questions.forEach(question => {
      const hasChoices = question.choices && question.choices.length > 0;
      const isFuturePublication = false; // Always false in our mock
      
      let type;
      if (hasChoices) {
        type = isFuturePublication ? 'future_with_choices' : 'published_with_votes';
      } else {
        type = isFuturePublication ? 'future_choiceless' : 'published_choiceless';
      }
      
      switch (type) {
        case 'published_with_votes':
          publishedWithVotes.push(question);
          break;
        case 'future_with_choices':
          futureWithChoices.push(question);
          break;
        case 'published_choiceless':
          publishedChoiceless.push(question);
          break;
        case 'future_choiceless':
          futureChoiceless.push(question);
          break;
        default:
          break;
      }
    });

    return {
      publishedWithVotes,
      futureWithChoices,
      publishedChoiceless,
      futureChoiceless
    };
  },
  getQuestionCardColor: () => 'blue'
}));


describe('ResultsSummary', () => {
  let mockUseQuery;
  
  beforeEach(() => {
    cleanup();
    // Set up the mock for each test
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseQuery.mockReset();
  });

  const renderResultsSummary = () => {
    return render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });
  };

  describe('Data Loading States', () => {
    test('renders loading state initially', () => {
      const scenario = TEST_SCENARIOS.RESULTS_SUMMARY_LOADING;
      mockUseQuery.mockReturnValue(scenario);
      
      renderResultsSummary();
      assertResultsSummaryLoadingState();
    });

    test('renders error state on API fetch failure', () => {
      const scenario = TEST_SCENARIOS.RESULTS_SUMMARY_ERROR;
      mockUseQuery.mockReturnValue(scenario);
      
      renderResultsSummary();
      assertResultsSummaryErrorState(scenario.error);
    });

    test('renders empty state when no questions exist', () => {
      const scenario = TEST_SCENARIOS.RESULTS_SUMMARY_EMPTY;
      mockUseQuery.mockReturnValue(scenario);
      
      renderResultsSummary();
      assertResultsSummaryEmptyState();
    });
  });

  describe('Results Display', () => {
    test('renders poll results summary with correct counts and percentages', () => {
      const scenario = TEST_SCENARIOS.RESULTS_SUMMARY_SUCCESS;
      mockUseQuery.mockReturnValue(scenario);
      
      renderResultsSummary();
      assertResultsSummarySuccessState(scenario.data);
      assertResultsSummaryQuestionResults(scenario.data.questions_results);
    });

    test('renders multiple questions with correct statistics', () => {
      const scenario = TEST_SCENARIOS.RESULTS_SUMMARY_MULTIPLE_QUESTIONS;
      mockUseQuery.mockReturnValue(scenario);
      
      renderResultsSummary();
      assertResultsSummarySuccessState(scenario.data);
      assertResultsSummaryQuestionResults(scenario.data.questions_results);
    });
  });
});