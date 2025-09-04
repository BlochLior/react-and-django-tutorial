import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../test-utils';
import { createQuestions } from '../../test-utils/test-data';
import AdminDashboard from './AdminDashboard';

// Mock the useQuery hook to control its behavior in tests
jest.mock('../../hooks/useQuery', () => {
  const originalModule = jest.requireActual('../../hooks/useQuery');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  };
});

// Mock child components to isolate the test
jest.mock('../../components/admin/AdminQuestionList', () => () => <div data-testid="admin-question-list" />);

describe('AdminDashboard', () => {
  let mockUseQuery;
  
  beforeEach(() => {
    // Set up the mock for each test
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseQuery.mockReset();
  });

  test('renders loading message initially', () => {
    // Mock the useQuery hook to return loading state
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });
    
    render(<AdminDashboard />);
    expect(screen.getByText('Loading questions...')).toBeInTheDocument();
  });

  test('renders the AdminQuestionList after a successful API fetch', async () => {
    const mockQuestions = createQuestions(2);
    const mockApiResponse = {
      count: 2,
      results: mockQuestions,
    };
    
    // Mock the useQuery hook to return success state
    mockUseQuery.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null
    });
    
    render(<AdminDashboard />);
    
    // The component should immediately show the questions
    expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
    expect(screen.getByTestId('admin-question-list')).toBeInTheDocument();
  });

  test('renders an error message on API fetch failure', async () => {
    // Mock the useQuery hook to return an error state
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network Error'
    });
    
    render(<AdminDashboard />);
    
    // The component should immediately show the error message
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  test('renders a "No questions available" message when the API returns an empty array', async () => {
    const mockApiResponse = {
      count: 0,
      results: [],
    };
    
    // Mock the useQuery hook to return success state with empty data
    mockUseQuery.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null
    });
    
    render(<AdminDashboard />);
    
    // The component should immediately show the no questions message
    expect(screen.getByText('No questions available yet.')).toBeInTheDocument();
  });

  test('displays correct statistics when questions are loaded', async () => {
    const mockQuestions = createQuestions(5);
    const mockApiResponse = {
      count: 5,
      results: mockQuestions,
    };
    
    // Mock the useQuery hook to return success state and trigger onSuccess callback
    mockUseQuery.mockImplementation((queryFn, deps, options) => {
      // Simulate the onSuccess callback being called
      if (options?.onSuccess) {
        setTimeout(() => options.onSuccess(mockApiResponse), 0);
      }
      return {
        data: mockApiResponse,
        loading: false,
        error: null
      };
    });
    
    render(<AdminDashboard />);
    
    // Wait for the onSuccess callback to be triggered
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
    
    // Verify the stats are displayed correctly
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
  });
});