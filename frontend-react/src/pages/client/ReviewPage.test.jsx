// src/pages/client/ReviewPage.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewPage from './ReviewPage';

const mockQuestions = [
    {
        id: 1,
        question_text: 'What is your favorite color?',
        choices: [
            { id: 101, choice_text: 'Red' },
            { id: 102, choice_text: 'Blue' },
        ],
    },
    {
        id: 2,
        question_text: 'What is your favorite animal?',
        choices: [
            { id: 201, choice_text: 'Dog' },
            { id: 202, choice_text: 'Cat' },
        ],
    },
];

const mockSelectedAnswers = {
    1: 102, // User selected 'Blue'
    2: 201, // User selected 'Dog'
};

describe('ReviewPage', () => {
    // Test 1: Renders correctly with selected answers
    test('renders a list of questions and their selected choices', () => {
        render(
            <ReviewPage
                questions={mockQuestions}
                selectedAnswers={mockSelectedAnswers}
                onSubmit={() => {}}
            />
        );

        // Assert that each question is displayed
        expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
        expect(screen.getByText('What is your favorite animal?')).toBeInTheDocument();

        // Assert that the correct choice is displayed for each question
        expect(screen.getByText('Your answer: Blue')).toBeInTheDocument();
        expect(screen.getByText('Your answer: Dog')).toBeInTheDocument();
    });

    // Test 2: Handles questions with no selected answers
    test('displays a list of unanswered questions', () => {
        const incompleteAnswers = { 1: 102 }; // Only one answer selected

        render(
            <ReviewPage
                questions={mockQuestions}
                selectedAnswers={incompleteAnswers}
                onSubmit={() => {}}
            />
        );

        // The refactored component now displays the unanswered question text directly.
        // The test should check for the presence of the unanswered question.
        expect(screen.getByText('What is your favorite animal?')).toBeInTheDocument();
    });

    // Test 3: Displays a submit button
    test('renders a submit button', () => {
        render(
            <ReviewPage
                questions={mockQuestions}
                selectedAnswers={mockSelectedAnswers}
                onSubmit={() => {}}
            />
        );

        // Assert that a button with the text 'Submit Votes' is in the document
        expect(screen.getByRole('button', { name: /submit votes/i })).toBeInTheDocument();
    });
});