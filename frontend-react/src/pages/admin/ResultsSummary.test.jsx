import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryChakraRouterWrapper } from '../../test-utils';
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

// Mock a full data response from the /admin/summary/ endpoint
const mockFullSummaryData = {
  "total_questions": 1,
  "total_votes_all_questions": 10,
  "questions_results": [
    {
      "id": 1,
      "question_text": "What is your favorite color?",
      "total_votes": 10,
      "choices": [
        { "id": 1, "choice_text": "Red", "votes": 10 }
      ]
    }
  ]
};

// Mock an empty data response
const mockEmptySummaryData = {
    "total_questions": 0,
    "total_votes_all_questions": 0,
    "questions_results": []
};

describe('ResultsSummary', () => {
  let mockUseQuery;
  
  beforeEach(() => {
    // Set up the mock for each test
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseQuery.mockReset();
  });

  test('renders component with minimal data', async () => {
    // Mock the useQuery hook to return minimal success state
    mockUseQuery.mockReturnValue({
      data: { total_questions: 0, total_votes_all_questions: 0, questions_results: [] },
      loading: false,
      error: null
    });

    render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });

    // Just check if the component renders at all
    expect(screen.getByText('No results to display.')).toBeInTheDocument();
  });

  test('renders overall poll results summary with correct counts and percentages', async () => {
    // Mock the useQuery hook to return success state
    mockUseQuery.mockReturnValue({
      data: mockFullSummaryData,
      loading: false,
      error: null
    });

    render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });

    // The component should immediately show the results (no loading state)
    expect(screen.getByText('Poll Results Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Votes')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Check the first question card - look for the question text
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    
    // Check choices and percentages for the first question
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('10 votes')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  test('displays a message when there are no questions', async () => {
    // Mock the useQuery hook to return success state with empty data
    mockUseQuery.mockReturnValue({
      data: mockEmptySummaryData,
      loading: false,
      error: null
    });

    render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });

    // The component should immediately show the no results message
    expect(screen.getByText('No results to display.')).toBeInTheDocument();
  });

  test('handles API fetching error', async () => {
    // Mock the useQuery hook to return an error state
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch poll results.'
    });

    render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });
    
    // The component should immediately show the error message
    expect(screen.getByText('Failed to fetch poll results.')).toBeInTheDocument();
  });

  test('shows loading state initially', async () => {
    // Mock the useQuery hook to return loading state
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(<ResultsSummary />, { wrapper: QueryChakraRouterWrapper });
    
    // The component should show the loading message
    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });
});