import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminQuestionList from './AdminQuestionList';

// Mock the child component to isolate the test
jest.mock('./AdminQuestionCard', () => ({ question }) => (
  <div data-testid={`admin-card-${question.id}`}>{question.question_text}</div>
));

describe('AdminQuestionList', () => {
  const mockQuestions = [
    { id: 1, question_text: 'Question 1' },
    { id: 2, question_text: 'Question 2' },
  ];

  test('renders a list of AdminQuestionCards', () => {
    render(
      <Router>
        <AdminQuestionList questions={mockQuestions} />
      </Router>
    );

    // Assert that both mock question cards are in the document
    expect(screen.getByTestId('admin-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('admin-card-2')).toBeInTheDocument();
  });

  test('renders a message when the question list is empty', () => {
    render(<AdminQuestionList questions={[]} />);
    expect(screen.getByText('No questions available.')).toBeInTheDocument();
  });
});