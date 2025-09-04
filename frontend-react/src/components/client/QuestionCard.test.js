import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import { createQuestion } from '../../test-utils/test-data';
import QuestionCard from './QuestionCard';

const mockQuestion = createQuestion({
  id: 1,
  question_text: 'What is your favorite color?',
  choices: [
    { id: 101, choice_text: 'Red' },
    { id: 102, choice_text: 'Blue' },
    { id: 103, choice_text: 'Green' },
  ],
});

describe('QuestionCard', () => {
  test('renders question text and all choices', () => {
    render(<QuestionCard question={mockQuestion} />);

    // Check that the question text is in the document
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();

    // Check that all choice texts are in the document using data-testid
    const radioButtons = screen.getAllByTestId('chakra-radio');
    expect(radioButtons).toHaveLength(3);
    
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  test('calls onAnswerChange with correct IDs when a choice is selected', () => {
    const mockOnAnswerChange = jest.fn();
    render(<QuestionCard question={mockQuestion} onAnswerChange={mockOnAnswerChange} />);

    // Simulate a click on the 'Blue' radio button (second radio button)
    const radioButtons = screen.getAllByTestId('chakra-radio');
    const blueRadio = radioButtons[1]; // Blue is the second choice
    fireEvent.click(blueRadio);

    // Expect the mock function to have been called with the correct arguments
    expect(mockOnAnswerChange).toHaveBeenCalledWith(mockQuestion.id, 102);
  });

  test('correctly highlights the selected choice based on prop', () => {
    const selectedChoiceId = 102;
    render(<QuestionCard question={mockQuestion} selectedAnswer={selectedChoiceId} />);

    // Check that the RadioGroup has the correct value using data-value
    const radioGroup = screen.getByTestId('chakra-radiogroup');
    expect(radioGroup).toHaveAttribute('data-value', '102');
  });
});