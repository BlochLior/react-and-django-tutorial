import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import PollsContainer from './PollsContainer';

// Mock axios to control API responses
jest.mock('axios');

// Mock child components to isolate the test
jest.mock('../../components/client/QuestionList', () => () => <div data-testid="question-list" />);
jest.mock('../../components/ui/Pagination', () => () => <div data-testid="pagination" />);

describe('PollsContainer', () => {
  // Use a spy to silence console errors for this test suite
  let consoleErrorSpy;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // Test 1: renders loading state initially
  test('renders loading message initially', () => {
    // Mock a pending promise to keep the component in a loading state
    axios.get.mockResolvedValue(new Promise(() => {}));
    render(<PollsContainer />);
    expect(screen.getByText('Loading polls...')).toBeInTheDocument();
  });

  // Test 2: Renders polls on successful API response
  test('renders polls after successful API fetch', async () => {
    const mockApiResponse = {
      data: {
        results: [{ id: 1, question_text: 'Test Question' }],
        next: null,
        previous: null,
        total_pages: 1,
        page: 1,
      },
    };
    axios.get.mockResolvedValue(mockApiResponse);

    render(<PollsContainer />);

    // Use findByTestId to wait for the asynchronous update to finish
    await screen.findByTestId('question-list');

    // Assert that the loading message is gone and the components are rendered
    expect(screen.queryByText('Loading polls...')).not.toBeInTheDocument();
    expect(screen.getByTestId('question-list')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
  
  // Test 3: Renders error message on API fetch failure
  test('renders error message on API fetch failure', async () => {
    // Mock a failed response
    axios.get.mockRejectedValue(new Error('Network Error'));

    render(<PollsContainer />);
    
    // Use a regular expression to match the error message flexibly
    const errorMessage = await screen.findByText(/Error:/i);
    expect(errorMessage).toBeInTheDocument();
  });
});