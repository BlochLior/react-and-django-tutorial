import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { createQuestion } from '../../test-utils/test-data';
import AdminQuestionCard from './AdminQuestionCard';

const mockQuestion = createQuestion({
  id: 1,
  question_text: 'What is your favorite color?',
  choices: [
    { id: 101, choice_text: 'Red' },
    { id: 102, choice_text: 'Blue' },
  ],
  pub_date: '2025-08-12T12:00:00Z',
});

describe('AdminQuestionCard', () => {
  test('renders the question text and action buttons', () => {
    render(<AdminQuestionCard question={mockQuestion} />);

    expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument();
    expect(screen.getByText('Edit Question')).toBeInTheDocument();
  });

  test('renders question metadata correctly', () => {
    render(<AdminQuestionCard question={mockQuestion} />);

    // Check that choice count is displayed
    expect(screen.getByText('Choices: 2')).toBeInTheDocument();
    
    // Check that question ID is displayed
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    
    // Check that publication date is displayed
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  test('renders with different question data', () => {
    const differentQuestion = createQuestion({
      id: 5,
      question_text: 'What is your favorite food?',
      choices: [
        { id: 201, choice_text: 'Pizza' },
        { id: 202, choice_text: 'Burger' },
        { id: 203, choice_text: 'Salad' },
      ],
      pub_date: '2025-08-15T10:00:00Z',
    });

    render(<AdminQuestionCard question={differentQuestion} />);

    expect(screen.getByText('What is your favorite food?')).toBeInTheDocument();
    expect(screen.getByText('Choices: 3')).toBeInTheDocument();
    expect(screen.getByText('ID: 5')).toBeInTheDocument();
  });

  test('handles question with single choice', () => {
    const singleChoiceQuestion = createQuestion({
      id: 10,
      question_text: 'Single choice question',
      choices: [{ id: 301, choice_text: 'Only option' }],
      pub_date: '2025-08-20T14:00:00Z',
    });

    render(<AdminQuestionCard question={singleChoiceQuestion} />);

    expect(screen.getByText('Choices: 1')).toBeInTheDocument();
    expect(screen.getByText('ID: 10')).toBeInTheDocument();
  });

  test('handles question with many choices', () => {
    const manyChoicesQuestion = createQuestion({
      id: 20,
      question_text: 'Many choices question',
      choices: Array.from({ length: 8 }, (_, i) => ({
        id: 400 + i,
        choice_text: `Choice ${i + 1}`,
      })),
      pub_date: '2025-08-25T16:00:00Z',
    });

    render(<AdminQuestionCard question={manyChoicesQuestion} />);

    expect(screen.getByText('Choices: 8')).toBeInTheDocument();
    expect(screen.getByText('ID: 20')).toBeInTheDocument();
  });

  test('maintains proper component structure', () => {
    render(<AdminQuestionCard question={mockQuestion} />);

    // Should have the main card container
    const card = screen.getByTestId('chakra-card');
    expect(card).toBeInTheDocument();
    
    // Should have card body
    const cardBody = screen.getByTestId('chakra-cardbody');
    expect(cardBody).toBeInTheDocument();
    
    // Should have card footer
    const cardFooter = screen.getByTestId('chakra-cardfooter');
    expect(cardFooter).toBeInTheDocument();
    
    // Should have the edit button (rendered as a link due to as={RouterLink})
    const editButton = screen.getByRole('link', { name: /edit question/i });
    expect(editButton).toBeInTheDocument();
  });

  test('edit button has correct navigation properties', () => {
    render(<AdminQuestionCard question={mockQuestion} />);

    const editButton = screen.getByRole('link', { name: /edit question/i });
    
    // Should have the correct navigation path
    expect(editButton).toHaveAttribute('data-to', '/admin/questions/1');
    
    // Should have the correct styling
    expect(editButton).toHaveAttribute('data-colorscheme', 'teal');
    expect(editButton).toHaveAttribute('data-variant', 'outline');
  });
});
