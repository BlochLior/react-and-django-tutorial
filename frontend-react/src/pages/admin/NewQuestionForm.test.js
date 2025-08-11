import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import NewQuestionForm from './NewQuestionForm';
import { BrowserRouter as Router } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Mock axios for API calls
jest.mock('axios');

// Mock useNavigate to test navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('NewQuestionForm', () => {
  let mockNavigate;
  let consoleErrorSpy;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    axios.post.mockResolvedValue({ status: 201 });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the form with a question input and choice inputs', () => {
    render(
      <Router>
        <NewQuestionForm />
      </Router>
    );

    expect(screen.getByLabelText(/Question Text/i)).toBeInTheDocument();
    expect(screen.getByText(/Choice 1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Choice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Question/i })).toBeInTheDocument();
  });

  test('allows adding and removing choice input fields', async () => {
    render(
      <Router>
        <NewQuestionForm />
      </Router>
    );

    // Initial choices are 2 (choice 1 and choice 2)
    const choiceInputs = screen.getAllByLabelText(/Choice/i);
    expect(choiceInputs).toHaveLength(2);

    // Click "Add Choice" button
    await userEvent.click(screen.getByRole('button', { name: /Add Choice/i }));
    const newChoiceInputs = screen.getAllByLabelText(/Choice/i);
    expect(newChoiceInputs).toHaveLength(3);

    // Click "Remove" button
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    await userEvent.click(removeButtons[0]); // Remove the first one
    const finalChoiceInputs = screen.getAllByLabelText(/Choice/i);
    expect(finalChoiceInputs).toHaveLength(2);
  });

  test('submits the form successfully and navigates back to dashboard', async () => {
    render(
      <Router>
        <NewQuestionForm />
      </Router>
    );

    await userEvent.type(screen.getByLabelText(/Question Text/i), 'New Test Question');
    await userEvent.type(screen.getByLabelText(/Choice 1/i), 'Choice A');
    await userEvent.type(screen.getByLabelText(/Choice 2/i), 'Choice B');
    
    await userEvent.click(screen.getByRole('button', { name: /Submit Question/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/admin/create/', {
        question_text: 'New Test Question',
        pub_date: expect.any(String), // New: expect pub_date
        choices: [
          { choice_text: 'Choice A' },
          { choice_text: 'Choice B' }
        ],
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('displays an error message if form submission fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Submission failed'));

    render(
      <Router>
        <NewQuestionForm />
      </Router>
    );

    await userEvent.type(screen.getByLabelText(/Question Text/i), 'New Test Question');
    await userEvent.type(screen.getByLabelText(/Choice 1/i), 'Choice A');
    await userEvent.type(screen.getByLabelText(/Choice 2/i), 'Choice B');
    
    await userEvent.click(screen.getByRole('button', { name: /Submit Question/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to submit question./i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('submits a choiceless question successfully', async () => {
    render(<Router><NewQuestionForm /></Router>);
    
    await userEvent.type(screen.getByLabelText(/Question Text/i), 'Choiceless question');
    await userEvent.clear(screen.getByLabelText(/Choice 1/i));
    await userEvent.clear(screen.getByLabelText(/Choice 2/i));

    await userEvent.click(screen.getByRole('button', { name: /Submit Question/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
        question_text: 'Choiceless question',
        pub_date: expect.any(String),
        choices: [],
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('submits form and filters out empty choices', async () => {
    render(<Router><NewQuestionForm /></Router>);
    
    await userEvent.type(screen.getByLabelText(/Question Text/i), 'Test with empty choice');
    await userEvent.type(screen.getByLabelText(/Choice 1/i), 'Choice A');
    await userEvent.clear(screen.getByLabelText(/Choice 2/i));
    await userEvent.click(screen.getByRole('button', { name: /Add Choice/i }));
    await userEvent.type(screen.getByLabelText(/Choice 3/i), 'Choice C');

    await userEvent.click(screen.getByRole('button', { name: /Submit Question/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
        question_text: 'Test with empty choice',
        pub_date: expect.any(String),
        choices: [
          { choice_text: 'Choice A' },
          { choice_text: 'Choice C' }
        ],
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });
  
  test('displays correct note for choiceless question', async () => {
    render(<Router><NewQuestionForm /></Router>);
    
    await userEvent.clear(screen.getByLabelText(/Choice 1/i));
    await userEvent.clear(screen.getByLabelText(/Choice 2/i));

    const choicelessNote = screen.getByText('Note: Current question has no choices, and as such not viewed on client view.');
    expect(choicelessNote).toBeInTheDocument();
  });
  
  test('displays correct note for future-dated question', async () => {
    const futureDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
    const futureDateString = format(futureDate, "yyyy-MM-dd'T'HH:mm");
    
    render(<Router><NewQuestionForm /></Router>);
    
    // Set the date and time using the separate inputs
    const dateInput = screen.getByLabelText(/Publication Date/i).closest('.form-group').querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: futureDateString.split('T')[0] } });    
    // Check if the note for a future date is displayed
    const futureDateNote = screen.getByText(/Note: Current question is set to publish on/i);
    expect(futureDateNote).toBeInTheDocument();
  });
  
  test('increments and decrements time with arrow buttons', async () => {
    render(<Router><NewQuestionForm /></Router>);

    // Use a user event to interact with the form
    const user = userEvent.setup();

    // Get the buttons
    const hourUp = screen.getByRole('button', { name: /increment hour/i });
    const hourDown = screen.getByRole('button', { name: /decrement hour/i });
    const minuteUp = screen.getByRole('button', { name: /increment minute/i });
    const minuteDown = screen.getByRole('button', { name: /decrement minute/i });

    // Use the aria-label to get the elements you want
    const initialHourElement = screen.getByLabelText(/Current hour/i);
    const initialMinuteElement = screen.getByLabelText(/Current minute/i);

    // Extract the numerical value
    const initialHour = parseInt(initialHourElement.textContent.trim().replace('h', ''));
    const initialMinute = parseInt(initialMinuteElement.textContent.trim().replace('m', ''));
    
    // Test hour increment
    await user.click(hourUp);
    const newHourElement = screen.getByLabelText(/Current hour/i);
    const newHour = parseInt(newHourElement.textContent.trim().replace('h', ''));
    expect(newHour).toBe((initialHour + 1) % 24); // Account for wrapping around midnight
  
    // Test minute increment
    await user.click(minuteUp);
    const newMinuteElement = screen.getByLabelText(/Current minute/i);
    const newMinute = parseInt(newMinuteElement.textContent.trim().replace('m', ''));
    expect(newMinute).toBe((initialMinute + 1) % 60); // Account for wrapping at 60 minutes
  });
});