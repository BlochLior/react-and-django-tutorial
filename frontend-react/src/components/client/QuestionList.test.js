import { render, screen } from '@testing-library/react';
import QuestionList from './QuestionList';

// Mock the child component to simplify the test
jest.mock('./QuestionCard', () => (props) => (
  <div data-testid={`question-card-${props.question.id}`}>{props.question.question_text}</div>
));

const mockQuestions = [
  { id: 1, question_text: 'Question 1' },
  { id: 2, question_text: 'Question 2' },
];

describe('QuestionList', () => {
  // Test 1: Renders a list of questions
  test('renders a list of QuestionCards when given an array of questions', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    render(<QuestionList 
      questions={mockQuestions}
      selectedAnswers={mockSelectedAnswers}
      onAnswerChange={mockOnAnswerChange}
    />);
    
    // Check if both mock questions are rendered
    expect(screen.getByTestId('question-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-2')).toBeInTheDocument();
  });

  // Test 2: Renders a message when no questions are available
  test('renders "No polls available" message when given an empty array', () => {
    const mockSelectedAnswers = {};
    const mockOnAnswerChange = jest.fn();
    render(<QuestionList 
      questions={[]}
      selectedAnswers={mockSelectedAnswers}
      onAnswerChange={mockOnAnswerChange}
    />);
    
    // Check for the specific no-polls message
    expect(screen.getByText('No polls available at the moment.')).toBeInTheDocument();
  });
});