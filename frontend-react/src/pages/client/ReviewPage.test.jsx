import React from 'react';
import { 
  render, 
  cleanup,
  screen,
  TEST_SCENARIOS,
  assertReviewPageElements,
  assertReviewPageSubmitState,
  assertReviewPageEmptyState,
  assertReviewPageIncompleteAnswers,
  assertReviewPageSubmission,
  createUserEvent
} from '../../test-utils';
import ReviewPage from './ReviewPage';

describe('ReviewPage', () => {
  beforeEach(() => {
    cleanup();
  });

  const renderReviewPage = (props = {}) => {
    const defaultProps = {
      questions: TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS.questions,
      selectedAnswers: TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS.selectedAnswers,
      onSubmit: TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS.onSubmit,
    };
    
    return render(<ReviewPage {...defaultProps} {...props} />);
  };

  describe('Default Rendering', () => {
    test('renders questions and their selected choices', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS;
      renderReviewPage(scenario);
      
      assertReviewPageElements(scenario.questions, scenario.selectedAnswers);
    });

    test('renders submit button in enabled state', () => {
      renderReviewPage();
      
      assertReviewPageSubmitState(true);
    });
  });

  describe('Edge Cases', () => {
    test('handles questions with incomplete answers', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_INCOMPLETE_ANSWERS;
      renderReviewPage(scenario);
      
      assertReviewPageIncompleteAnswers(scenario.questions, scenario.selectedAnswers);
    });

    test('handles empty questions array', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_EMPTY;
      renderReviewPage(scenario);
      
      assertReviewPageEmptyState();
    });

    test('handles single question', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_SINGLE_QUESTION;
      renderReviewPage(scenario);
      
      assertReviewPageElements(scenario.questions, scenario.selectedAnswers);
    });

    test('handles no answers selected', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_NO_ANSWERS;
      renderReviewPage(scenario);
      
      assertReviewPageSubmitState(false);
    });
  });

  describe('User Interactions', () => {
    test('calls onSubmit when submit button is clicked', async () => {
      const user = createUserEvent();
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS;
      const mockOnSubmit = jest.fn();
      
      renderReviewPage({ ...scenario, onSubmit: mockOnSubmit });

      const submitButton = screen.getByRole('button', { name: /submit all votes/i });
      await user.click(submitButton);

      assertReviewPageSubmission(mockOnSubmit);
    });

    test('submit button is disabled when no questions are answered', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_NO_ANSWERS;
      renderReviewPage(scenario);
      
      assertReviewPageSubmitState(false);
    });

    test('submit button is enabled when at least one question is answered', () => {
      const scenario = TEST_SCENARIOS.REVIEW_PAGE_COMPLETE_ANSWERS;
      renderReviewPage(scenario);
      
      assertReviewPageSubmitState(true);
    });
  });
});