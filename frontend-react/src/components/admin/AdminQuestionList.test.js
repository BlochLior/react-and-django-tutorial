import React from 'react';
import { screen } from '@testing-library/react';
import { 
  render, 
  createQuestions, 
  TEST_SCENARIOS,
  assertAdminQuestionListElements,
  assertAdminQuestionListEmptyState,
  assertAdminQuestionListCards
} from '../../test-utils';
import AdminQuestionList from './AdminQuestionList';

// Mock the child component to isolate the test
jest.mock('./AdminQuestionCard', () => ({ question }) => (
  <div data-testid={`admin-card-${question.id}`}>
    <div data-testid={`question-text-${question.id}`}>{question.question_text}</div>
    <div data-testid={`question-id-${question.id}`}>ID: {question.id}</div>
  </div>
));

describe('AdminQuestionList', () => {
  // Test data using centralized factories
  const mockQuestions = createQuestions(3, {
    question_text: 'Test Question',
    choices: [
      { id: 1, choice_text: 'Choice 1' },
      { id: 2, choice_text: 'Choice 2' },
    ],
  });

  describe('Initial Rendering', () => {
    test('renders a list of AdminQuestionCards when questions are provided', () => {
      render(<AdminQuestionList questions={mockQuestions} />);

      // Use centralized assertion helper
      assertAdminQuestionListCards(mockQuestions);
    });

    test('maintains proper component structure', () => {
      render(<AdminQuestionList questions={mockQuestions} />);
      
      // Use centralized assertion helper
      assertAdminQuestionListElements(3);
    });
  });

  describe('Empty State Handling', () => {
    test('renders empty state when questions array is empty', () => {
      render(<AdminQuestionList questions={[]} />);
      
      assertAdminQuestionListEmptyState();
    });

    test('renders empty state when questions array is null', () => {
      render(<AdminQuestionList questions={null} />);
      
      assertAdminQuestionListEmptyState();
    });

    test('renders empty state when questions array is undefined', () => {
      render(<AdminQuestionList questions={undefined} />);
      
      assertAdminQuestionListEmptyState();
    });
  });

  describe('Component Behavior', () => {
    test('handles single question correctly', () => {
      const singleQuestion = TEST_SCENARIOS.SINGLE_QUESTION.questions;
      
      render(<AdminQuestionList questions={singleQuestion} />);
      
      assertAdminQuestionListCards(singleQuestion);
      assertAdminQuestionListElements(1);
    });

    test('handles large number of questions efficiently', () => {
      const manyQuestions = createQuestions(10, {
        question_text: 'Question',
        choices: [{ id: 1, choice_text: 'Choice' }],
      });
      
      render(<AdminQuestionList questions={manyQuestions} />);
      
      // Use centralized assertion helper
      assertAdminQuestionListElements(10);
      
      // Verify no empty state is shown
      expect(screen.queryByText('No questions available')).not.toBeInTheDocument();
    });

    test('uses TEST_SCENARIOS for consistent test data', () => {
      const scenarioQuestions = TEST_SCENARIOS.MULTIPLE_QUESTIONS.questions;
      
      render(<AdminQuestionList questions={scenarioQuestions} />);
      
      assertAdminQuestionListCards(scenarioQuestions);
      assertAdminQuestionListElements(scenarioQuestions.length);
    });
  });
});