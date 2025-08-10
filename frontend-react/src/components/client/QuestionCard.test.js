import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "./QuestionCard";

const mockQuestion = {
    id: 1,
    question_text: 'What is your favorite color?',
    choices: [
      { id: 101, choice_text: 'Red' },
      { id: 102, choice_text: 'Blue' },
      { id: 103, choice_text: 'Green' },
    ],
  };

  describe('QuestionCard', () => {
    // Test 1: Renders question text and choices
    test('renders question text and all choices', () => {
      render(<QuestionCard question={mockQuestion} />);
  
      // Check that the question text is in the document
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
  
      // Check that all choice texts are in the document
      expect(screen.getByLabelText('Red')).toBeInTheDocument();
      expect(screen.getByLabelText('Blue')).toBeInTheDocument();
      expect(screen.getByLabelText('Green')).toBeInTheDocument();
    });
  
    // Test 2: Handles user selection via prop callback
    test('calls onAnswerChange with correct IDs when a choice is selected', () => {
      const mockOnAnswerChange = jest.fn();
      render(<QuestionCard question={mockQuestion} onAnswerChange={mockOnAnswerChange} />);
  
      // Simulate a click on the 'Blue' radio button
      const blueRadio = screen.getByLabelText('Blue');
      fireEvent.click(blueRadio);
  
      // Expect the mock function to have been called with the correct arguments
      expect(mockOnAnswerChange).toHaveBeenCalledWith(mockQuestion.id, 102);
    });
  
    // Test 3: Correctly highlights the selected choice
    test('correctly highlights the selected choice based on prop', () => {
      const selectedChoiceId = 102;
      render(<QuestionCard question={mockQuestion} selectedChoice={selectedChoiceId} />);
  
      // Find the 'Blue' radio button and check if it's checked
      const blueRadio = screen.getByLabelText('Blue');
      expect(blueRadio).toBeChecked();
  
      // Find the 'Red' radio button and check if it's not checked
      const redRadio = screen.getByLabelText('Red');
      expect(redRadio).not.toBeChecked();
    });
  });