import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminQuestionCard from './AdminQuestionCard';

const mockQuestion = {
  id: 1,
  question_text: 'What is your favorite color?',
  choices: [
    { id: 101, choice_text: 'Red' },
    { id: 102, choice_text: 'Blue' },
  ],
};

describe('AdminQuestionCard', () => {
  test('renders the question text and action buttons', () => {
    render(
      <Router>
        <AdminQuestionCard question={mockQuestion} />
      </Router>
    );

    expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view results/i })).toBeInTheDocument();
  });
});
