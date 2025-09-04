// src/pages/client/ReviewPage.test.jsx

import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { TEST_SCENARIOS } from '../../test-utils/test-data';
import ReviewPage from './ReviewPage';

describe('ReviewPage', () => {
  const renderReviewPage = (props = {}) => {
    const defaultProps = {
      questions: TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions,
      selectedAnswers: TEST_SCENARIOS.MULTIPLE_QUESTIONS.selectedAnswers,
      onSubmit: jest.fn(),
    };
    
    return render(<ReviewPage {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    test('renders questions and their selected choices', () => {
      renderReviewPage();

      // Assert that each question is displayed
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Question 3')).toBeInTheDocument();

      // Assert that the "Your answer:" badge and choice text are displayed separately
      // Since there are multiple "Your answer:" badges, use getAllByText
      const answerBadges = screen.getAllByText('Your answer:');
      expect(answerBadges).toHaveLength(3); // Should have 3 badges for 3 questions
      
      expect(screen.getByText('Choice A for Q1')).toBeInTheDocument();
      expect(screen.getByText('Choice A for Q2')).toBeInTheDocument();
      expect(screen.getByText('Choice A for Q3')).toBeInTheDocument();
    });

    test('renders submit button', () => {
      renderReviewPage();

      expect(screen.getByRole('button', { name: /submit all votes/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles questions with no selected answers', () => {
      renderReviewPage({
        questions: TEST_SCENARIOS.INCOMPLETE_ANSWERS.questions,
        selectedAnswers: TEST_SCENARIOS.INCOMPLETE_ANSWERS.selectedAnswers,
      });

      // Should display unanswered questions
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    test('handles empty questions array', () => {
      renderReviewPage({
        questions: [],
        selectedAnswers: {},
      });

      expect(screen.getByRole('button', { name: /submit all votes/i })).toBeInTheDocument();
    });

    test('handles single question', () => {
      renderReviewPage({
        questions: TEST_SCENARIOS.SINGLE_QUESTION.questions,
        selectedAnswers: TEST_SCENARIOS.SINGLE_QUESTION.selectedAnswers,
      });

      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
      expect(screen.getByText('Your answer:')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onSubmit when submit button is clicked', async () => {
      const mockOnSubmit = jest.fn();
      renderReviewPage({ onSubmit: mockOnSubmit });

      const submitButton = screen.getByRole('button', { name: /submit all votes/i });
      submitButton.click();

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });
});