import { render, screen } from '@testing-library/react';
// import userEvent for simulating user interactions
import userEvent from '@testing-library/user-event';

import QuestionDisplay from './QuestionDisplay';
import styles from './QuestionDisplay.module.css';


describe('QuestionDisplay', () => {
    // Define a mock question data to use in tests
    const mockQuestion = {
        id: 1,
        question_text: 'Who is the best?',
        pub_date: '2025-04-29T10:00:00Z',
        choices: [
            {id: 101, choice_text: 'You are the best', votes: 0},
            {id: 102, choice_text: 'I am the best', votes: 0},
            {id: 103, choice_text: 'Eyal Golan is second best, only to god which is the best', votes: 0},
        ],
    };

    it('should render the question text', () => {
        render(<QuestionDisplay question={mockQuestion} />);
        expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument();
    });
    it('should render all choices with their radio buttons', () => {
        render(<QuestionDisplay question={mockQuestion} />);
        mockQuestion.choices.forEach(choice => {
            expect(screen.getByText(choice.choice_text)).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: choice.choice_text })).toBeInTheDocument();
        });
    });
    it('should mark the correct radio button as checked when a choice is selected', () => {
        const selectedChoiceId = 102; // 'I am the best' is selected, its' id is 102
        render(<QuestionDisplay question={mockQuestion} selectedChoiceId={selectedChoiceId}/>);

        // Find the radio button for the selectedChoiceId
        // Use 'getByRole' withe the name, but check its 'checked' property
        const selectedRadioButton = screen.getByRole('radio', { name: 'I am the best'});
        expect(selectedRadioButton).toBeChecked();

        // Optional - make sure the rest of the buttons aren't checked
        const unselectedRadioButton1 = screen.getByRole('radio', { name: 'You are the best'});
        expect(unselectedRadioButton1).not.toBeChecked();
        const unselectedRadioButton2 = screen.getByRole('radio', { name: 'Eyal Golan is second best, only to god which is the best'});
        expect(unselectedRadioButton2).not.toBeChecked();
    });
    it('should call onSelectedChoice with the selected choice ID when a radio button is clicked', async () => {
        // Mock function using Vitest's `vi.fn()`
        const mockOnSelectChoice = vi.fn();
        const user = userEvent.setup(); // Setup user-event
        render(<QuestionDisplay
             question={mockQuestion}
             selectedChoiceId={null} // No initial selection for this test
             onSelectChoice={mockOnSelectChoice} // Pass the mock function as a prop
             />
            );
        // Simulate a click on the radio button for 'I am the best'
        const choiceToClick = mockQuestion.choices[1]; // index 1 is 'I am the best'
        const radioButton = screen.getByRole('radio', { name: choiceToClick.choice_text});

        await user.click(radioButton); // click simulated

        // Assert the mock function was called
        expect(mockOnSelectChoice).toHaveBeenCalledTimes(1);
        // Assert that it was called with the correct argument
        expect(mockOnSelectChoice).toHaveBeenCalledWith(choiceToClick.id);
    });
    it('should apply a visual highlight to the selected choice', () => {
        const selectedChoiceId = 102; // 'I am the best'

        render(<QuestionDisplay question={mockQuestion} selectedChoiceId={selectedChoiceId}/>);

        // Find the container div for the selected choice
        const selectedChoiceElement = screen.getByText('I am the best').closest('div'); // Get closest div that contains the text
        
        // Assert that the selected choice element has the 'selectedChoice' class
        expect(selectedChoiceElement).toHaveClass(styles.selectedChoice);

        // Optional - make sure the rest of the choices don't have the 'selectedChoice' class
        const unselectedChoiceElement1 = screen.getByText('You are the best').closest('div');
        expect(unselectedChoiceElement1).not.toHaveClass(styles.selectedChoice);
        const unselectedChoiceElement2 = screen.getByText('Eyal Golan is second best, only to god which is the best').closest('div');
        expect(unselectedChoiceElement2).not.toHaveClass(styles.selectedChoice);

    });

});