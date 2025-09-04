import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { createQuestions } from '../../test-utils/test-data';
import AdminQuestionList from './AdminQuestionList';

// Mock the child component to isolate the test
jest.mock('./AdminQuestionCard', () => ({ question }) => (
  <div data-testid={`admin-card-${question.id}`}>
    <div data-testid={`question-text-${question.id}`}>{question.question_text}</div>
    <div data-testid={`question-id-${question.id}`}>ID: {question.id}</div>
  </div>
));

describe('AdminQuestionList', () => {
  const mockQuestions = createQuestions(3, {
    question_text: 'Test Question',
    choices: [
      { id: 1, choice_text: 'Choice 1' },
      { id: 2, choice_text: 'Choice 2' },
    ],
  });

  test('renders a list of AdminQuestionCards when questions are provided', () => {
    render(<AdminQuestionList questions={mockQuestions} />);

    // Assert that all mock question cards are in the document
    expect(screen.getByTestId('admin-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('admin-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('admin-card-3')).toBeInTheDocument();
    
    // Verify question content is displayed
    expect(screen.getByTestId('question-text-1')).toHaveTextContent('Test Question');
    expect(screen.getByTestId('question-id-1')).toHaveTextContent('ID: 1');
  });

  test('renders a message when the question list is empty', () => {
    render(<AdminQuestionList questions={[]} />);
    
    expect(screen.getByText('No questions available')).toBeInTheDocument();
  });

  test('renders a message when questions array is null', () => {
    render(<AdminQuestionList questions={null} />);
    
    expect(screen.getByText('No questions available')).toBeInTheDocument();
  });

  test('renders a message when questions array is undefined', () => {
    render(<AdminQuestionList questions={undefined} />);
    
    expect(screen.getByText('No questions available')).toBeInTheDocument();
  });

  test('handles single question correctly', () => {
    const singleQuestion = createQuestions(1, {
      question_text: 'Single Question',
      choices: [{ id: 1, choice_text: 'Single Choice' }],
    });
    
    render(<AdminQuestionList questions={singleQuestion} />);
    
    expect(screen.getByTestId('admin-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-text-1')).toHaveTextContent('Single Question');
    expect(screen.queryByText('No questions available.')).not.toBeInTheDocument();
  });

  test('handles large number of questions', () => {
    const manyQuestions = createQuestions(10, {
      question_text: 'Question',
      choices: [{ id: 1, choice_text: 'Choice' }],
    });
    
    render(<AdminQuestionList questions={manyQuestions} />);
    
    // Should render all 10 questions
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByTestId(`admin-card-${i}`)).toBeInTheDocument();
    }
    
    expect(screen.queryByText('No questions available.')).not.toBeInTheDocument();
  });

  test('maintains proper component structure', () => {
    render(<AdminQuestionList questions={mockQuestions} />);
    
    // Should have the main container
    const container = screen.getByTestId('admin-question-list');
    expect(container).toBeInTheDocument();
    
    // Should have the correct number of question cards
    const questionCards = screen.getAllByTestId(/admin-card-/);
    expect(questionCards).toHaveLength(3);
  });
});