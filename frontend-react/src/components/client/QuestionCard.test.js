import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { 
  render, 
  createQuestion, 
  assertQuestionCardElements,
  assertQuestionCardSelectedChoice,
  assertQuestionCardAnswerChange
} from '../../test-utils';
import QuestionCard from './QuestionCard';

describe('QuestionCard', () => {
  // Test data setup
  const mockQuestion = createQuestion({
    id: 1,
    question_text: 'What is your favorite color?',
    choices: [
      { id: 101, choice_text: 'Red' },
      { id: 102, choice_text: 'Blue' },
      { id: 103, choice_text: 'Green' },
    ],
  });

  describe('Initial Rendering', () => {
    test('renders question text and all choices correctly', () => {
      render(<QuestionCard question={mockQuestion} />);

      // Use centralized assertion helper
      assertQuestionCardElements(mockQuestion);
    });
  });

  describe('User Interactions', () => {
    test('calls onAnswerChange with correct IDs when a choice is selected', () => {
      const mockOnAnswerChange = jest.fn();
      render(<QuestionCard question={mockQuestion} onAnswerChange={mockOnAnswerChange} />);

      // Simulate a click on the 'Blue' radio button (second radio button)
      const radioButtons = screen.getAllByTestId('chakra-radio');
      const blueRadio = radioButtons[1]; // Blue is the second choice
      fireEvent.click(blueRadio);

      // Use centralized assertion helper
      assertQuestionCardAnswerChange(mockOnAnswerChange, mockQuestion.id, 102);
    });
  });

  describe('Component State', () => {
    test('correctly highlights the selected choice based on prop', () => {
      const selectedChoiceId = 102;
      render(<QuestionCard question={mockQuestion} selectedAnswer={selectedChoiceId} />);

      // Check that the component renders with the selected answer
      // The tip message should be visible when an answer is selected
      expect(screen.getByText(/Tip: Click your selected answer again/)).toBeInTheDocument();
      
      // Also use centralized assertion helper
      assertQuestionCardSelectedChoice(selectedChoiceId);
    });

    test('handles no selected answer gracefully', () => {
      render(<QuestionCard question={mockQuestion} />);

      // Should render without errors and no selection
      assertQuestionCardElements(mockQuestion);
      
      // Check that no radio buttons are checked
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).not.toHaveAttribute('data-checked');
        expect(radio.getAttribute('aria-checked')).not.toBe('true');
      });
      
      // The tip message should not be visible when nothing is selected
      expect(screen.queryByText(/Tip: Click your selected answer again/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles question with no choices', () => {
      const questionWithNoChoices = createQuestion({
        id: 2,
        question_text: 'Question with no choices',
        choices: [],
      });

      render(<QuestionCard question={questionWithNoChoices} />);

      // Should render question text but no radio buttons
      expect(screen.getByText('Question with no choices')).toBeInTheDocument();
      expect(screen.queryByTestId('chakra-radio')).not.toBeInTheDocument();
    });

    test('handles question with single choice', () => {
      const questionWithSingleChoice = createQuestion({
        id: 3,
        question_text: 'Single choice question',
        choices: [{ id: 201, choice_text: 'Only option' }],
      });

      render(<QuestionCard question={questionWithSingleChoice} />);

      assertQuestionCardElements(questionWithSingleChoice);
    });
  });
});