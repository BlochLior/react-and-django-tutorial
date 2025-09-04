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

const mockQuestions = createQuestions(3, {
  question_text: 'Test Question',
  choices: [
    { id: 1, choice_text: 'Choice 1' },
    { id: 2, choice_text: 'Choice 2' },
  ],
});

describe('QuestionList', () => {
  test('renders a list of QuestionCards when given an array of questions', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={mockQuestions}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    // Check if all mock questions are rendered
    expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-3')).toBeInTheDocument();
    
    // Verify question content is displayed
    expect(screen.getByTestId('question-text-1')).toHaveTextContent('Test Question');
    expect(screen.getByTestId('question-choices-1')).toHaveTextContent('2 choices');
  });

  test('renders "No polls available" message when given an empty array', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={[]}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    // Check for the specific no-polls message
    expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  });

  test('renders "No polls available" message when questions array is null', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={null}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  });

  test('renders "No polls available" message when questions array is undefined', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={undefined}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  });

  test('handles single question correctly', () => {
    const singleQuestion = createQuestions(1, {
      question_text: 'Single Question',
      choices: [{ id: 1, choice_text: 'Single Choice' }],
    });
    
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={singleQuestion}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-text-1')).toHaveTextContent('Single Question');
    expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
  });

  test('handles large number of questions', () => {
    const manyQuestions = createQuestions(10, {
      question_text: 'Question',
      choices: [{ id: 1, choice_text: 'Choice' }],
    });
    
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={manyQuestions}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    // Should render all 10 questions
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByTestId(`question-card-${i}`)).toBeInTheDocument();
    }
    
    expect(screen.queryByText('No polls available at the moment.')).not.toBeInTheDocument();
  });

  test('passes correct props to QuestionCard components', () => {
    const mockSelectedAnswers = { 1: 101, 2: 202 };
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={mockQuestions}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    // Verify that all question cards are rendered with the correct data
    expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-3')).toBeInTheDocument();
  });

  test('maintains proper component structure', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    
    render(
      <QuestionList 
        questions={mockQuestions}
        selectedAnswers={mockSelectedAnswers}
        onAnswerChange={mockOnAnswerChange}
      />
    );
    
    // Should have the main container
    const container = screen.getByTestId('question-list');
    expect(container).toBeInTheDocument();
    
    // Should have the correct number of question cards
    const questionCards = screen.getAllByTestId(/question-card-/);
    expect(questionCards).toHaveLength(3);
  });
});