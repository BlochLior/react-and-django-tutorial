import React from 'react';
import { screen } from '@testing-library/react';
import { render, createQuestion, TEST_SCENARIOS, assertAdminQuestionCardElements } from '../../test-utils';
import AdminQuestionCard from './AdminQuestionCard';

describe('AdminQuestionCard', () => {
  // Use TEST_SCENARIOS for consistent test data
  const { questions: [defaultQuestion] } = TEST_SCENARIOS.SINGLE_QUESTION;

  describe('Initial Rendering', () => {
    test('renders the question text and action buttons', () => {
      render(<AdminQuestionCard question={defaultQuestion} />);

      expect(screen.getByText(defaultQuestion.question_text)).toBeInTheDocument();
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
    });

    test('renders question metadata correctly', () => {
      render(<AdminQuestionCard question={defaultQuestion} />);

      // Check that choice count is displayed
      expect(screen.getByText(`Choices: ${defaultQuestion.choices.length}`)).toBeInTheDocument();
      
      // Check that question ID is displayed
      expect(screen.getByText(`ID: ${defaultQuestion.id}`)).toBeInTheDocument();
      
      // Check that publication date is displayed
      expect(screen.getByText(/Published:/)).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    test('renders with different question data', () => {
      const differentQuestion = createQuestion({
        id: 5,
        question_text: 'What is your favorite food?',
        choices: [
          { id: 201, choice_text: 'Pizza' },
          { id: 202, choice_text: 'Burger' },
          { id: 203, choice_text: 'Salad' },
        ],
        pub_date: '2025-08-15T10:00:00Z',
      });

      render(<AdminQuestionCard question={differentQuestion} />);

      expect(screen.getByText('What is your favorite food?')).toBeInTheDocument();
      expect(screen.getByText('Choices: 3')).toBeInTheDocument();
      expect(screen.getByText('ID: 5')).toBeInTheDocument();
    });

    test('handles question with single choice', () => {
      const singleChoiceQuestion = createQuestion({
        id: 10,
        question_text: 'Single choice question',
        choices: [{ id: 301, choice_text: 'Only option' }],
        pub_date: '2025-08-20T14:00:00Z',
      });

      render(<AdminQuestionCard question={singleChoiceQuestion} />);

      expect(screen.getByText('Choices: 1')).toBeInTheDocument();
      expect(screen.getByText('ID: 10')).toBeInTheDocument();
    });

    test('handles question with many choices', () => {
      const manyChoicesQuestion = createQuestion({
        id: 20,
        question_text: 'Many choices question',
        choices: Array.from({ length: 8 }, (_, i) => ({
          id: 400 + i,
          choice_text: `Choice ${i + 1}`,
        })),
        pub_date: '2025-08-25T16:00:00Z',
      });

      render(<AdminQuestionCard question={manyChoicesQuestion} />);

      expect(screen.getByText('Choices: 8')).toBeInTheDocument();
      expect(screen.getByText('ID: 20')).toBeInTheDocument();
    });

    test('handles question with no choices', () => {
      const { questions: [noChoicesQuestion] } = TEST_SCENARIOS.EMPTY_CHOICES;

      render(<AdminQuestionCard question={noChoicesQuestion} />);

      expect(screen.getByText('Choices: 0')).toBeInTheDocument();
      expect(screen.getByText(`ID: ${noChoicesQuestion.id}`)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('maintains proper component structure and navigation', () => {
      render(<AdminQuestionCard question={defaultQuestion} />);

      // Use centralized assertion helper for consistent testing
      assertAdminQuestionCardElements(defaultQuestion);
    });
  });
});
