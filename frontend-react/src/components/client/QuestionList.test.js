import React from 'react';
import { screen, cleanup } from '@testing-library/react';
import { 
  render, 
  createQuestions, 
  TEST_SCENARIOS,
  assertQuestionListElements,
  assertQuestionListEmptyState,
  assertQuestionListCards
} from '../../test-utils';
import QuestionList from './QuestionList';

// Mock the child component to simplify the test
jest.mock('./QuestionCard', () => (props) => (
  <div data-testid={`question-card-${props.question.id}`}>
    <div data-testid={`question-text-${props.question.id}`}>{props.question.question_text}</div>
    <div data-testid={`question-choices-${props.question.id}`}>
      {props.question.choices.length} choices
    </div>
  </div>
));

describe('QuestionList', () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      questions: TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions,
      selectedAnswers: TEST_SCENARIOS.MULTIPLE_QUESTIONS.selectedAnswers,
      onAnswerChange: jest.fn(),
    };
    return render(<QuestionList {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    cleanup();
  });

  describe('Initial Rendering', () => {
    test('renders a list of QuestionCards when given an array of questions', () => {
      const questions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      renderComponent();
      
      // Use centralized assertion helpers
      assertQuestionListElements(questions.length);
      assertQuestionListCards(questions);
    });

    test('renders "No polls available" message when given an empty array', () => {
      renderComponent({ questions: [] });
      assertQuestionListEmptyState();
    });

    test('renders "No polls available" message when questions array is null', () => {
      renderComponent({ questions: null });
      assertQuestionListEmptyState();
    });

    test('renders "No polls available" message when questions array is undefined', () => {
      renderComponent({ questions: undefined });
      assertQuestionListEmptyState();
    });
  });

  describe('Edge Cases', () => {
    test('handles single question correctly', () => {
      const singleQuestion = TEST_SCENARIOS.SINGLE_QUESTION.questions;
      renderComponent({ questions: singleQuestion });
      
      assertQuestionListElements(1);
      assertQuestionListCards(singleQuestion);
      expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
    });

    test('handles large number of questions', () => {
      const manyQuestions = createQuestions(10, {
        question_text: 'Question',
        choices: [{ id: 1, choice_text: 'Choice' }],
      });
      
      renderComponent({ questions: manyQuestions });
      
      assertQuestionListElements(10);
      assertQuestionListCards(manyQuestions);
      expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
    });

    test('handles questions with no choices', () => {
      const questionsWithNoChoices = TEST_SCENARIOS.EMPTY_CHOICES.questions;
      renderComponent({ questions: questionsWithNoChoices });
      
      assertQuestionListElements(1);
      assertQuestionListCards(questionsWithNoChoices);
    });

    test('handles incomplete answers scenario', () => {
      const incompleteAnswers = TEST_SCENARIOS.INCOMPLETE_ANSWERS;
      renderComponent(incompleteAnswers);
      
      assertQuestionListElements(incompleteAnswers.questions.length);
      assertQuestionListCards(incompleteAnswers.questions);
    });
  });

  describe('Component Structure', () => {
    test('maintains proper component structure', () => {
      const questions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      renderComponent();
      
      assertQuestionListElements(questions.length);
    });

    test('passes correct props to QuestionCard components', () => {
      const mockSelectedAnswers = { 1: 101, 2: 202 };
      const mockOnAnswerChange = jest.fn();
      const questions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      
      renderComponent({ 
        selectedAnswers: mockSelectedAnswers,
        onAnswerChange: mockOnAnswerChange 
      });
      
      // Verify that all question cards are rendered with the correct data
      assertQuestionListCards(questions);
    });
  });

  describe('Component State', () => {
    test('handles different selectedAnswers states', () => {
      const questions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      
      // Test with empty selectedAnswers
      renderComponent({ selectedAnswers: {} });
      assertQuestionListCards(questions);
      cleanup();
      
      // Test with partial selectedAnswers
      renderComponent({ selectedAnswers: { 1: 101 } });
      assertQuestionListCards(questions);
      cleanup();
      
      // Test with complete selectedAnswers
      renderComponent({ selectedAnswers: TEST_SCENARIOS.MULTIPLE_QUESTIONS.selectedAnswers });
      assertQuestionListCards(questions);
    });

    test('handles onAnswerChange callback', () => {
      const mockOnAnswerChange = jest.fn();
      const questions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      
      renderComponent({ onAnswerChange: mockOnAnswerChange });
      
      // Verify component renders correctly with callback
      assertQuestionListCards(questions);
      expect(mockOnAnswerChange).not.toHaveBeenCalled();
    });
  });
});