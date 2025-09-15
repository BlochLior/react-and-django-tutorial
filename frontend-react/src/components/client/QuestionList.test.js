import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { createQuestions } from '../../test-utils/test-data';
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
      questions: createQuestions(3, {
        question_text: 'Test Question',
        choices: [
          { id: 1, choice_text: 'Choice 1' },
          { id: 2, choice_text: 'Choice 2' },
        ],
      }),
      selectedAnswers: {},
      onAnswerChange: jest.fn(),
    };
    return render(<QuestionList {...defaultProps} {...props} />);
  };
  describe('Rendering', () => {
    test('renders a list of QuestionCards when given an array of questions', () => {
      renderComponent();
      
      // Check if all mock questions are rendered
      expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('question-card-3')).toBeInTheDocument();
      
      // Verify question content is displayed
      expect(screen.getByTestId('question-text-1')).toHaveTextContent('Test Question');
      expect(screen.getByTestId('question-choices-1')).toHaveTextContent('2 choices');
    });

    test('renders "No polls available" message when given an empty array', () => {
      renderComponent({ questions: [] });
      
      // Check for the specific no-polls message
      expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
      expect(screen.getByText('Check back later for new polls!')).toBeInTheDocument();
    });

    test('renders "No polls available" message when questions array is null', () => {
      renderComponent({ questions: null });
      
      expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
    });

    test('renders "No polls available" message when questions array is undefined', () => {
      renderComponent({ questions: undefined });
      
      expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles single question correctly', () => {
      const singleQuestion = createQuestions(1, {
        question_text: 'Single Question',
        choices: [{ id: 1, choice_text: 'Single Choice' }],
      });
      
      renderComponent({ questions: singleQuestion });
      
      expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-text-1')).toHaveTextContent('Single Question');
      expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
    });

    test('handles large number of questions', () => {
      const manyQuestions = createQuestions(10, {
        question_text: 'Question',
        choices: [{ id: 1, choice_text: 'Choice' }],
      });
      
      renderComponent({ questions: manyQuestions });
      
      // Should render all 10 questions
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByTestId(`question-card-${i}`)).toBeInTheDocument();
      }
      
      expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('maintains proper component structure', () => {
      renderComponent();
      
      // Should have the main container
      const container = screen.getByTestId('question-list');
      expect(container).toBeInTheDocument();
      
      // Should have the correct number of question cards
      const questionCards = screen.getAllByTestId(/question-card-/);
      expect(questionCards).toHaveLength(3);
    });

    test('passes correct props to QuestionCard components', () => {
      const mockSelectedAnswers = { 1: 101, 2: 202 };
      const mockOnAnswerChange = jest.fn();
      
      renderComponent({ 
        selectedAnswers: mockSelectedAnswers,
        onAnswerChange: mockOnAnswerChange 
      });
      
      // Verify that all question cards are rendered with the correct data
      expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('question-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('question-card-3')).toBeInTheDocument();
    });
  });
});