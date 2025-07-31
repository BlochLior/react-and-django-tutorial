import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClientPollPage from './ClientPollPage';
import QuestionDisplay from '../QuestionDisplay/QuestionDisplay';

describe('ClientPollPage', () => {
    // A mock that represents the full poll data that ClientPollPage would fetch from the API
    const mockPollData = {
        id: 1,
        question_text: 'Favorite American president?',
        pub_date: '2025-04-29T10:00:00Z',
        choices: [
            {id: 101, choice_text: 'George Washington', votes: 0},
            {id: 102, choice_text: 'John F. Kennedy', votes: 0},
            {id: 103, choice_text: 'Barack Obama', votes: 0},
            {id: 104, choice_text: 'Donald Trump', votes: 0},
            {id: 105, choice_text: 'Joe Biden', votes: 0},
        ],
    };
    // This hook runs after each test in the describe block
    afterEach(() => {
        // Restores all mocks created with vi.fn()
        vi.restoreAllMocks();
    });
    
    it('should render the QuestionDisplay component with question data (via fetching)', async () => {
        // Mock the global fetch function for the test
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true, // Simulate a successful response
                json: () => Promise.resolve(mockPollData), // Return the mock data
            })
        );
        const pollId = 1;
        render(<ClientPollPage pollId={pollId}/>);

        // Await for the question text, since ClientPollPage fetches data async
        await screen.findByText(mockPollData.question_text);

        expect(screen.getByText(mockPollData.question_text)).toBeInTheDocument();
        expect(screen.getByText('George Washington')).toBeInTheDocument();
    });

    it('should display an error message if poll data fetching fails', async () => {
        // Mock fetch to simulate a network error or bad response
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false, // Simulate a failed response
                status: 404,
                json: () => Promise.resolve({ detail: 'Not Found' }), // Error message
            })
        );
        const pollId = 999; // A poll id that won't exist
        render(<ClientPollPage pollId={pollId}/>);

        // Expect loading state initially
        expect(screen.getByText('Loading poll...')).toBeInTheDocument();

        // Wait for an error message to appear
        await screen.findByText(/Error loading poll/i); // Regex to match any case of "Error loading poll"

        // Assert fetch was called
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(`/api/polls/${pollId}/`);

        // Assert that the question text isn't rendered
        expect(screen.queryByText(mockPollData.question_text)).not.toBeInTheDocument();
    });
    it('should update selectedChoiceId state and pass it to QuestionDisplay when a choice is made', async () => {
        // This test checks the `checked` state of the radio buttons
        
        // Mock fetch to ensure data loads successfully
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockPollData),
            })
        );
        const pollId = 1;
        const user = userEvent.setup(); // Setup user-event
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load components to render
        await screen.findByText(mockPollData.question_text);

        // Find g.w. and donald trump radio buttons
        const gWRadioButton = screen.getByRole('radio', { name: mockPollData.choices[0].choice_text });
        const dTRadioButton = screen.getByRole('radio', { name: mockPollData.choices[3].choice_text });

        // Initially, radios should not be checked
        expect(gWRadioButton).not.toBeChecked();
        expect(dTRadioButton).not.toBeChecked();

        // Simulate a click on g.w. radio button
        await user.click(gWRadioButton);

        // Assert g.w. radio button is checked
        expect(gWRadioButton).toBeChecked();
        expect(dTRadioButton).not.toBeChecked();

        // Now simulate a click on d.t. radio button
        await user.click(dTRadioButton);

        // Assert d.t. radio button is checked
        expect(gWRadioButton).not.toBeChecked();
        expect(dTRadioButton).toBeChecked();
    });
})