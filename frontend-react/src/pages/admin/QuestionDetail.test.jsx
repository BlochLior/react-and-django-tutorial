import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuestionDetail from "./QuestionDetail";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import axios from 'axios';

// Mock hooks directly
const mockUseNavigate = jest.fn();

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUseNavigate,
}));

// Mock the axios module to control API responses
jest.mock('axios');

describe('Question Detail View', () => {
    const setup = async (initialEntries = ['/admin/questions/123/']) => {
        mockUseNavigate.mockClear();

        const mockApiResponse = {
            data: {
                id: 1,
                question_text: 'What is your favorite color?',
                pub_date: '2025-08-12T12:00:00Z',
                choices: [
                    { id: 1, choice_text: 'Red', votes: 0 },
                    { id: 2, choice_text: 'Blue', votes: 0 },
                ],
            },
        };
        
        axios.get.mockResolvedValue(mockApiResponse);

        render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/admin/questions/:questionId/" element={<QuestionDetail />} />
                    <Route path="/admin/" element={<div>Admin Dashboard</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByLabelText(/question text:/i));
        await waitFor(() => screen.getByLabelText(/choice 1:/i));

        return mockUseNavigate;
    };

    test('renders the form with pre-filled question data on initial load', async () => {
        await setup();
        
        const questionTextInput = screen.getByLabelText(/question text:/i);
        const choice1Input = screen.getByLabelText(/choice 1:/i);
        const choice2Input = screen.getByLabelText(/choice 2:/i);
        
        expect(questionTextInput).toHaveValue('What is your favorite color?');
        expect(choice1Input).toHaveValue('Red');
        expect(choice2Input).toHaveValue('Blue');
    });

    test('successfully edits a question and navigates back to the list', async () => {
        const navigateSpy = await setup();
        const user = userEvent.setup();
        
        const questionInput = screen.getByLabelText(/question text:/i);
        await user.clear(questionInput);
        await user.type(questionInput, 'Updated Question');

        axios.put.mockResolvedValueOnce({});

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveButton);

        await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/admin/'));
    });

    test('successfully deletes a question and navigates back to the list', async () => {
        const navigateSpy = await setup();
        const user = userEvent.setup();
        jest.spyOn(window, 'confirm').mockReturnValue(true);

        axios.delete.mockResolvedValueOnce({});

        const deleteButton = screen.getByRole('button', { name: /delete question/i });
        await user.click(deleteButton);
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this question?');
        await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/admin/'));
    });
});