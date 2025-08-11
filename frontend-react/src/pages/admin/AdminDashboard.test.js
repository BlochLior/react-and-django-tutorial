import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock axios to simulate API calls
jest.mock('axios');

// Mock child components to isolate the test # TODO: don't have this component yet
jest.mock('../../components/admin/AdminQuestionList', () => () => <div data-testid="admin-question-list" />);

describe('AdminDashboard', () => {
  // Mock the API response for a successful fetch
  const mockApiResponse = {
    data: [
      { id: 1, question_text: 'Question A', choices: [] },
      { id: 2, question_text: 'Question B', choices: [] },
    ],
  };

  test('renders loading message initially', () => {
    // Mock a pending promise to keep the component in a loading state
    axios.get.mockResolvedValue(new Promise(() => {}));
    render(<AdminDashboard />);
    expect(screen.getByText('Loading questions...')).toBeInTheDocument();
  });

  test('renders the AdminQuestionList after a successful API fetch', async () => {
    axios.get.mockResolvedValue(mockApiResponse);
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
    await waitFor(() => {
      expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
      expect(screen.getByTestId('admin-question-list')).toBeInTheDocument();
    });
  });

  test('renders an error message on API fetch failure', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch questions/i)).toBeInTheDocument();
    });
  });

  test('renders a "No questions available" message when the API returns an empty array', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
    await waitFor(() => {
      expect(screen.getByText('No questions available.')).toBeInTheDocument();
    });
  });
});