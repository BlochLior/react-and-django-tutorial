import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import NewQuestion from './NewQuestion';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// We mock react-router-dom to control navigation in our tests.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// We mock axios to prevent real API calls.
jest.mock('axios');

// A reusable setup function to render the component and initialize mocks.
const setup = () => {
  // Use a fake timer to control dates for consistent testing.
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-08-12T10:30:00.000Z'));
  mockNavigate.mockClear();
  axios.post.mockClear();

  render(
    <MemoryRouter initialEntries={['/admin/new']}>
      <Routes>
        <Route path="/admin/new" element={<NewQuestion />} />
        {/* A route for the navigation target to prevent warnings */}
        <Route path="/admin/" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// Use `beforeEach` to set up fresh mocks for each test.
beforeEach(() => {
  setup();
});

// Use `afterEach` to clean up.
afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('NewQuestion', () => {
  const fillOutForm = async (user, question, choices) => {
    await user.type(screen.getByLabelText(/question text:/i), question);
  
    // Correcting the loop to handle the label text exactly as it's rendered
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      
      // Use the correct label text
      const labelText = `Choice ${i + 1}:`; 
      const choiceInput = screen.getByLabelText(labelText);
      await user.clear(choiceInput); // It's good practice to clear before typing
      await user.type(choiceInput, choice);
    }
  };

  test('renders the form with required inputs and buttons', () => {
    expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choice 1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add choice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit question/i })).toBeInTheDocument();
  });

  test('allows adding and removing choice input fields', async () => {
    const user = userEvent.setup({ delay: null });

    const initialChoiceInputs = screen.getAllByLabelText(/choice/i);
    expect(initialChoiceInputs).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /add choice/i }));
    expect(screen.getAllByLabelText(/choice/i)).toHaveLength(3);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[removeButtons.length - 1]);
    expect(screen.getAllByLabelText(/choice/i)).toHaveLength(2);
  });

  test('submits the form successfully and navigates back to the dashboard', async () => {
    const user = userEvent.setup({ delay: null });

    axios.post.mockResolvedValueOnce({ status: 201 });

    await fillOutForm(user, 'New Test Question', ['Choice A', 'Choice B']);
    await user.click(screen.getByRole('button', { name: /submit question/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          question_text: 'New Test Question',
          pub_date: '2025-08-12T13:30:00.000Z',
          choices: [{ choice_text: 'Choice A' }, { choice_text: 'Choice B' }],
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/');
    });
  });

  test('displays an error message if form submission fails', async () => {
    const user = userEvent.setup({ delay: null });

    axios.post.mockRejectedValueOnce(new Error('Submission failed'));

    await fillOutForm(user, 'Failing Question', ['Choice X']);
    await user.click(screen.getByRole('button', { name: /submit question/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit question/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('submits form with a choiceless question successfully', async () => {
    const user = userEvent.setup({ delay: null });

    axios.post.mockResolvedValueOnce({ status: 201 });

    await fillOutForm(user, 'Choiceless question', []);
    await user.click(screen.getByRole('button', { name: /submit question/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          question_text: 'Choiceless question',
          pub_date: '2025-08-12T13:30:00.000Z',
          choices: [],
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/');
    });
  });

  test('displays and removes note for choiceless question', async () => {
    const user = userEvent.setup({ delay: null });

    await fillOutForm(user, 'Choiceless question', []);

    await waitFor(() => {
      expect(screen.getByText(/Note: Current question has no choices/i)).toBeInTheDocument();
    });

    // Fill in a choice to make the note disappear
    await user.type(screen.getByLabelText(/choice 1/i), 'New Choice');

    await waitFor(() => {
      expect(screen.queryByText(/Note: Current question has no choices/i)).not.toBeInTheDocument();
    });
  });

  test('displays correct note for future-dated question', async () => {
    const user = userEvent.setup({ delay: null });

    await fillOutForm(user, 'Future Question', ['Choice 1', 'Choice 2']);

    // 2. Set the publication date to a future date.
    // The date input needs to be located and then typed into.
    const dateInput = screen.getByLabelText(/Publication Date/i);
    await user.clear(dateInput); // Clear the input first
    await user.type(dateInput, '2025-08-22');

    // 3. Use waitFor to wait for the DOM to update.
    // The component will re-render with the futureDateNote after the state is updated.
    await waitFor(() => {
        // Expect the future date note to now be present
        expect(screen.getByText(/Note: Current question is set to publish on 2025-08-22/i)).toBeInTheDocument();
        // The empty choice note should no longer be in the document
        expect(screen.queryByText(/Note: At least one choice field is empty/i)).not.toBeInTheDocument();
    });
  });

  test('increments and decrements time with arrow buttons', async () => {
    const user = userEvent.setup({ delay: null });

    console.log('Test Mock Date:', new Date());

    const initialHourElement = screen.getByLabelText(/Current hour/i);
    const initialHour = parseInt(initialHourElement.textContent);
    console.log('Initial Rendered Hour:', initialHour);

    await user.click(screen.getByRole('button', { name: /increment hour/i }));

    const newHourElement = await screen.findByLabelText(/Current hour/i);
    const newHour = parseInt(newHourElement.textContent);
    console.log('New Rendered Hour:', newHour);

    // The initial hour is 16, so incrementing it should be 17
    expect(newHour).toBe(17); 

    const initialMinuteElement = screen.getByLabelText(/Current minute/i);
    const initialMinute = parseInt(initialMinuteElement.textContent);
    
    await user.click(screen.getByRole('button', { name: /increment minute/i }));

    const newMinuteElement = await screen.findByLabelText(/Current minute/i);
    const newMinute = parseInt(newMinuteElement.textContent);
    
    // The initial minute is 30, so incrementing it should be 31
    expect(newMinute).toBe(31); 
  });
});