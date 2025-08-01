import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClientPollPage from './ClientPollPage';

describe('ClientPollPage', () => {
    // A mock that represents the full poll data that ClientPollPage, one with multiple questions
    const mockMultiQuestionPollData = {
        questions: [
            {
                id: 1,
                question_text: 'Who is your favorite American president?',
                pub_date: '2025-04-29T10:00:00Z',
                choices: [
                    {id: 101, choice_text: 'George Washington', votes: 0},
                    {id: 102, choice_text: 'John F. Kennedy', votes: 0},
                    {id: 103, choice_text: 'Barack Obama', votes: 0},
                    {id: 104, choice_text: 'Donald Trump', votes: 0},
                    {id: 105, choice_text: 'Joe Biden', votes: 0},
                ],
            },
            {
                id: 2,
                question_text: 'What is your favorite meme?',
                pub_date: '2025-04-29T10:00:00Z',
                choices: [
                    {id: 201, choice_text: 'Doge', votes: 0},
                    {id: 202, choice_text: 'Rickroll', votes: 0},
                    {id: 203, choice_text: 'Pickle Rick', votes: 0},
                    {id: 204, choice_text: 'Winter is coming', votes: 0},
                    {id: 205, choice_text: 'Why not both', votes: 0},
                ],
            },
            {
                id: 3,
                question_text: 'What is your favorite TV series',
                pub_date: '2025-04-29T10:00:00Z',
                choices: [
                    {id: 301, choice_text: 'Game of Thrones', votes: 0},
                    {id: 302, choice_text: 'Rick and Morty', votes: 0},
                    {id: 303, choice_text: 'Stranger Things', votes: 0},
                    {id: 304, choice_text: 'How I Met Your Mother', votes: 0},
                    {id: 305, choice_text: 'The Office', votes: 0},
                ],
            },
            {
                id: 4,
                question_text: 'What is your favorite movie',
                pub_date: '2025-04-29T10:00:00Z',
                choices: [
                    {id: 401, choice_text: 'The Godfather', votes: 0},
                    {id: 402, choice_text: 'The Godfather Part II', votes: 0},
                    {id: 403, choice_text: 'The Dark Knight', votes: 0},
                ],
            },
            {
                id: 5,
                question_text: 'Who is your favorite superhero',
                pub_date: '2025-04-29T10:00:00Z',
                choices: [
                    {id: 501, choice_text: 'Spiderman', votes: 0},
                    {id: 502, choice_text: 'Batman', votes: 0},
                    {id: 503, choice_text: 'Superman', votes: 0},
                    {id: 504, choice_text: 'Ironman', votes: 0},
                    {id: 505, choice_text: 'Deadpool', votes: 0},
                ],
            }
        ]
        
        
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
                json: () => Promise.resolve(mockMultiQuestionPollData), // Return the mock data
            })
        );
        const pollId = 1;
        render(<ClientPollPage pollId={pollId}/>);

        // Await for the question text, since ClientPollPage fetches data async
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        expect(screen.getByText(mockMultiQuestionPollData.questions[0].question_text)).toBeInTheDocument();
        expect(screen.getByText('George Washington')).toBeInTheDocument();
    });

    it('should display an error message if poll data fetching fails', async () => {
        // save original console.error function
        const originalConsoleError = console.error;
        // replace console.error with a mock function that doesn't throw an error
        console.error = vi.fn();
        
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
        expect(screen.queryByText(mockMultiQuestionPollData.questions[0].question_text)).not.toBeInTheDocument();

        // Restore original console.error function
        console.error = originalConsoleError;
    });
    it('should update selectedChoiceId state and pass it to QuestionDisplay when a choice is made', async () => {
        // This test checks the `checked` state of the radio buttons

        // Mock fetch to ensure data loads successfully
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockMultiQuestionPollData),
            })
        );
        const pollId = 1;
        const user = userEvent.setup(); // Setup user-event
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load components to render
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        // Find g.w. and donald trump radio buttons
        const gWRadioButton = screen.getByRole('radio', { name: mockMultiQuestionPollData.questions[0].choices[0].choice_text });
        const dTRadioButton = screen.getByRole('radio', { name: mockMultiQuestionPollData.questions[0].choices[3].choice_text });

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
    it('should submit the selected choice when the submit button is clicked', async () => {
        // Mock initial GET fetch for the poll data
        global.fetch = vi.fn(url => {
            if (url === `/api/polls/${pollId}/`) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockMultiQuestionPollData),
                });
            }
            // For any other URL (expected to be the POST vote URL), a seperate mock will be defined later
            return Promise.reject(new Error('Unexpected fetch call'));
        });
        
        const user = userEvent.setup();
        const pollId = 1;

        render(<ClientPollPage pollId={pollId}/>);

        // 1. Wait for the poll data to load
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        // 2. Find the submit button
        // If no button found with 'Submit Form' text, test will fail
        const submitButton = screen.getByRole('button', { name: /Submit Vote/i }); // Case-insensitive regex
        expect(submitButton).toBeInTheDocument();

        // 3. Wait for the initial disabled state to apply for the submit button
        await waitFor(() => expect(submitButton).toBeDisabled());

        // 4. Select a choice for the first question (e.g. George Washington)
        const selectedChoice = mockMultiQuestionPollData.questions[0].choices[0];
        const gWRadioButton = screen.getByRole('radio', { name: selectedChoice.choice_text });
        await user.click(gWRadioButton);

        // Verify the choice is selected (just for confidence)
        expect(gWRadioButton).toBeChecked();

        // 5. Button should become enabled after the selection
        await waitFor(() => expect(submitButton).toBeEnabled());
        
        // Mock the POST request response after the initial GET mock
        // Ensure this mock only applies to the vote submission URL
        global.fetch.mockImplementationOnce((url) => {
            if (url === `/api/polls/${pollId}/vote/`) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ message: 'Vote submitted successfully' }),
                });
            }
            // If another fetch call happens that is not the vote URL, let it fail
            return Promise.reject(new Error('Unexpected fetch POST call'));
        });

        // 6. Click the submit button
        await user.click(submitButton);

        // 7. Assert the POST request was made with the correct data
        // This needs to check the second call to fetch, since first one was for get
        expect(global.fetch).toHaveBeenCalledTimes(2);

        const postCallArgs = global.fetch.mock.calls[1]; // Get arguments for the second fetch call
        expect(postCallArgs[0]).toBe(`/api/polls/${pollId}/vote/`); // URL should match
        expect(postCallArgs[1]).toMatchObject({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: {
                [mockMultiQuestionPollData.questions[0].id]: selectedChoice.id
            }}),
        });

        // 8. Assert a success message is displayed
        expect(screen.getByText('Vote submitted successfully')).toBeInTheDocument();
    });
    it('should render all questions from the poll data', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockMultiQuestionPollData),
            })
        );
        const pollId = 1;
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        // Assert all questions are rendered
        for (const question of mockMultiQuestionPollData.questions) {
            expect(screen.getByText(question.question_text)).toBeInTheDocument();
        }
    });
    it('should display poll progress (answered X of Y questions and % complete)', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockMultiQuestionPollData),
            })
        );
        const pollId = 1;
        const user = userEvent.setup();
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        const totalQuestions = mockMultiQuestionPollData.questions.length; // Should be 5, as this mock has 5 questions

        // 1. Initially, no questions are answered
        expect(screen.getByText(`Answered 0 of ${totalQuestions} questions`)).toBeInTheDocument();
        expect(screen.getByText(`0% Complete`)).toBeInTheDocument();

        // 2. Select an answer for the first question
        const firstQuestionChoices = mockMultiQuestionPollData.questions[0].choices;
        await user.click(screen.getByRole('radio', { name: firstQuestionChoices[0].choice_text }));

        // 3. Assert progress is updated
        expect(screen.getByText(`Answered 1 of ${totalQuestions} questions`)).toBeInTheDocument();
        expect(screen.getByText(`20% Complete`)).toBeInTheDocument();

        // 4. Select answers for all remaining questions
        for (let i = 1; i < totalQuestions; i++) {
            const questionChoices = mockMultiQuestionPollData.questions[i].choices;
            await user.click(screen.getByRole('radio', { name: questionChoices[0].choice_text }));
        }

        // 5. Assert progress is updated
        expect(screen.getByText(`Answered ${totalQuestions} of ${totalQuestions} questions`)).toBeInTheDocument();
        expect(screen.getByText(`100% Complete`)).toBeInTheDocument();
    });
    it('should enable submit button only when at least one choice is selected', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockMultiQuestionPollData),
            })
        );
        const pollId = 1;
        const user = userEvent.setup();
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        const submitButton = screen.getByRole('button', { name: /Submit Vote/i });

        // Initially, no choices are selected, so the submit button should be disabled
        expect(submitButton).toBeDisabled();

        // Select a choice for the first question
        const firstQuestionChoices = mockMultiQuestionPollData.questions[0].choices;
        await user.click(screen.getByRole('radio', { name: firstQuestionChoices[0].choice_text }));

        // Submit button should now be enabled
        expect(submitButton).toBeEnabled();
    });
    it('should show a "Review Answers" button and transition to review phase when clicked', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockMultiQuestionPollData),
            })
        );
        const pollId = 1;
        const user = userEvent.setup();
        render(<ClientPollPage pollId={pollId}/>);

        // Wait for the poll data to load
        await screen.findByText(mockMultiQuestionPollData.questions[0].question_text);

        let reviewButton = screen.queryByRole('button', { name: /Review Answers/i });
        expect(reviewButton).toBeInTheDocument();
        expect(reviewButton).toBeDisabled();

        // Select a choice for the first question to enable/show the review button
        const firstQuestionChoices = mockMultiQuestionPollData.questions[0].choices;
        await user.click(screen.getByRole('radio', { name: firstQuestionChoices[0].choice_text }));

        // After selecting one choice, the "Review Answers" button should be in the document
        // This should be done with findByRole because it might appear slightly after state change
        reviewButton = await screen.findByRole('button', { name: /Review Answers/i });
        expect(reviewButton).toBeInTheDocument();
        expect(reviewButton).toBeEnabled();

        // Click the review button
        await user.click(reviewButton);

        // After clicking the UI should change to the review phase:
        // 1. The original question text for answering should be hidden
        //   (indicating that the user can't change their answers)
        await waitFor(() => {
            expect(screen.queryByText(mockMultiQuestionPollData.questions[0].question_text)).not.toBeInTheDocument();
        });

        // 2. A new heading specifically for the review phase should be displayed
        expect(screen.getByRole('heading', { name: /review answers/i })).toBeInTheDocument();
    });
})