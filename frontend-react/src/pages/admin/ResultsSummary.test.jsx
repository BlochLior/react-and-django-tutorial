import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import ResultsSummary from './ResultsSummary';

// Mock axios to control API responses
jest.mock('axios');

// Mock a full data response from the /admin/summary/ endpoint
const mockFullSummaryData = {
  "total_questions": 3,
  "total_votes_all_questions": 45,
  "questions_results": [
    {
      "id": 1,
      "question_text": "What is your favorite color?",
      "total_votes": 35, // Add total_votes property here
      "choices": [
        { "id": 1, "choice_text": "Red", "votes": 10 },
        { "id": 2, "choice_text": "Blue", "votes": 20 },
        { "id": 3, "choice_text": "Green", "votes": 5 }
      ]
    },
    {
      "id": 2,
      "question_text": "What is your favorite season?",
      "total_votes": 0,
      "choices": [
        { "id": 4, "choice_text": "Winter", "votes": 0 },
        { "id": 5, "choice_text": "Spring", "votes": 0 }
      ]
    },
    {
      "id": 3,
      "question_text": "This is a test question",
      "total_votes": 0,
      "choices": []
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
  test('renders overall poll results summary with correct counts and percentages', async () => {
    // Mock the API call for the single endpoint
    axios.get.mockResolvedValueOnce({ data: mockFullSummaryData });

    render(<ResultsSummary />);

    // Expect loading state initially
    expect(screen.getByText(/Loading results.../i)).toBeInTheDocument();

    await waitFor(() => {
      // Assert overall summary data
      expect(screen.getByText('Overall Poll Results')).toBeInTheDocument();
      expect(screen.getByText('Total Questions: 3')).toBeInTheDocument();
      expect(screen.getByText('Total Votes Across All Questions: 45')).toBeInTheDocument();
    });

    // Check the first question card
    const question1Card = screen.getByText(/What is your favorite color?/i).closest('.question-results-card');
    expect(question1Card).toBeInTheDocument();
    
    // Check choices and percentages within the first question card
    expect(within(question1Card).getByText('Red')).toBeInTheDocument();
    expect(within(question1Card).getByText('10 votes')).toBeInTheDocument();
    expect(within(question1Card).getByText('29%')).toBeInTheDocument();

    expect(within(question1Card).getByText('Blue')).toBeInTheDocument();
    expect(within(question1Card).getByText('20 votes')).toBeInTheDocument();
    expect(within(question1Card).getByText('57%')).toBeInTheDocument();
    
    expect(within(question1Card).getByText('Green')).toBeInTheDocument();
    expect(within(question1Card).getByText('5 votes')).toBeInTheDocument();
    expect(within(question1Card).getByText('14%')).toBeInTheDocument();

    // Check the second question card (with no votes)
    const question2Card = screen.getByText(/What is your favorite season?/i).closest('.question-results-card');
    expect(question2Card).toBeInTheDocument();

    // Change this line to get all matching vote counts
    const voteCounts = within(question2Card).getAllByText('0 votes');
    expect(voteCounts).toHaveLength(2); // Assert that two elements were found

    expect(within(question2Card).getByText('Winter')).toBeInTheDocument();
    expect(within(question2Card).getByText('Spring')).toBeInTheDocument();
    
    // The percentage text is also duplicated, so check that with getAllByText too
    const percentages = within(question2Card).getAllByText('0%');
    expect(percentages).toHaveLength(2);

    // Check the third question card (with no choices)
    const question3Card = screen.getByText(/This is a test question/i).closest('.question-results-card');
    expect(question3Card).toBeInTheDocument();
    
    expect(within(question3Card).getByText('No choices found for this question.')).toBeInTheDocument();

  });

  test('displays a message when there are no questions', async () => {
    axios.get.mockResolvedValueOnce({ data: mockEmptySummaryData });

    render(<ResultsSummary />);

    await waitFor(() => {
      expect(screen.getByText('No results to display.')).toBeInTheDocument();
    });
  });

  test('handles API fetching error', async () => {
    // Mock a rejected API call
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(<ResultsSummary />);
    
    await waitFor(() => {
        expect(screen.getByText('Failed to fetch poll results.')).toBeInTheDocument();
    });
  });
});