import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import PollsContainer from './PollsContainer';
import { useNavigate } from 'react-router-dom';

// Mock axios to control API responses
jest.mock('axios');

// Mock child components to isolate the test
jest.mock('../../components/client/QuestionList', () => () => <div data-testid="question-list" />);
jest.mock('../../components/ui/Pagination', () => () => <div data-testid="pagination" />);

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

/// Mock the ReviewPage component to simplify testing the parent's logic
jest.mock('./ReviewPage', () => ({ onSubmit }) => {
  return (
    <div>
      <button onClick={onSubmit}>Submit Votes</button>
    </div>
  );
});

const mockPollsResponse = {
  data: {
    results: [
      { id: 1, question_text: 'Question 1', choices: [] },
      { id: 2, question_text: 'Question 2', choices: [] },
    ],
    page: 1,
    total_pages: 1,
    previous: null,
    next: null,
  },
};

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

describe('PollsContainer - Vote Submission', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Successful submission
  test('submits votes successfully and navigates to the success page', async () => {
    // Mock the successful API calls
    axios.get.mockResolvedValue(mockPollsResponse);
    axios.post.mockResolvedValue({ status: 201 });

    render(<PollsContainer />);

    // 1. Wait for the polls to load and the "Review Answers" button to appear
    const reviewButton = await screen.findByRole('button', { name: /review answers/i });
    expect(reviewButton).toBeInTheDocument();

    // 2. Click the "Review Answers" button
    await userEvent.click(reviewButton);

    // 3. Wait for the "Submit Votes" button on the ReviewPage to appear
    const submitButton = await screen.findByRole('button', { name: /submit votes/i });
    expect(submitButton).toBeInTheDocument();

    // 4. Click the "Submit Votes" button
    await userEvent.click(submitButton);

    // Wait for the async post request and navigation to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/polls/vote/', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/success');
    });
  });

  // Test 2: Failed submission
  test('displays an error message when vote submission fails', async () => {
    // Mock successful GET but failed POST
    axios.get.mockResolvedValue(mockPollsResponse);
    axios.post.mockRejectedValue(new Error('Submission failed'));

    render(<PollsContainer />);

    // 1. Wait for the polls to load and the "Review Answers" button to appear
    const reviewButton = await screen.findByRole('button', { name: /review answers/i });
    expect(reviewButton).toBeInTheDocument();

    // 2. Click the "Review Answers" button
    await userEvent.click(reviewButton);

    // 3. Wait for the "Submit Votes" button on the ReviewPage to appear
    const submitButton = await screen.findByRole('button', { name: /submit votes/i });
    expect(submitButton).toBeInTheDocument();

    // 4. Click the "Submit Votes" button
    await userEvent.click(submitButton);

    await waitFor(() => {
      // Assert that the error message is displayed
      // The test should look for "Error: Failed to submit votes"
      expect(screen.getByText('Error: Failed to submit votes')).toBeInTheDocument();
      // Assert that navigation did NOT happen
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('PollsContainer - Pagination', () => {
  let consoleErrorSpy;
  beforeAll(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
      consoleErrorSpy.mockRestore();
  });

  test('navigates to the next page when the next button is clicked', async () => {
      const mockApiResponsePage1 = {
          data: {
              results: [{ id: 1, question_text: 'Test Question' }],
              next: 'http://.../polls/?page=2', // Mimics a next page URL
              previous: null,
              total_pages: 2,
              page: 1,
          },
      };
      const mockApiResponsePage2 = {
          data: {
              results: [{ id: 3, question_text: 'Another Question' }],
              next: null,
              previous: 'http://.../polls/?page=1',
              total_pages: 2,
              page: 2,
          },
      };

      axios.get.mockResolvedValueOnce(mockApiResponsePage1);
      
      render(<PollsContainer />);
      
      // Wait for the first page to load
      await screen.findByTestId('pagination');

      // Check that the next button is enabled
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeEnabled();

      // Mock the API call for the next page
      axios.get.mockResolvedValueOnce(mockApiResponsePage2);
      
      // Click the next button
      await userEvent.click(nextButton);

      // Assert that the API was called with the correct page number
      await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith('http://127.0.0.1:8000/polls/?page=2');
      });
  });
});