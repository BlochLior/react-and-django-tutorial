import { isPublicationDateFuture } from './dateUtils';

/**
 * Check if a question has choices
 * @param {Object} question - Question object
 * @returns {boolean} - True if the question has choices
 */
export const hasQuestionChoices = (question) => {
  return question.choices && question.choices.length > 0;
};

/**
 * Calculate the percentage of votes for a choice
 * @param {number} votes - Number of votes for a choice
 * @param {number} totalVotes - Total number of votes for the question
 * @returns {number} - Percentage of votes
 */
export const calculateVotePercentage = (votes, totalVotes) => {
  return totalVotes > 0 ? ((votes / totalVotes) * 100) : 0;
};

/**
 * Get the question type based on its publication date and choices
 * @param {Object} question - Question object
 * @returns {string} - 'published_with_votes', 'future_with_choices', 'published_choiceless', 'future_choiceless'
 */
export const getQuestionType = (question) => {
  const hasChoices = hasQuestionChoices(question);
  const isFuturePublication = isPublicationDateFuture(question.pub_date);

  if (hasChoices) {
    return isFuturePublication ? 'future_with_choices' : 'published_with_votes';
  } else {
    return isFuturePublication ? 'future_choiceless' : 'published_choiceless';
  }
};

/**
 * Categorize questions by their type
 * @param {Array} questions - Array of question objects
 * @returns {Object} - Object with categorized question arrays
 */
export const categorizeQuestions = (questions) => {
  const publishedWithVotes = [];
  const futureWithChoices = [];
  const publishedChoiceless = [];
  const futureChoiceless = [];

  questions.forEach(question => {
    const type = getQuestionType(question);
    
    switch (type) {
      case 'published_with_votes':
        publishedWithVotes.push(question);
        break;
      case 'future_with_choices':
        futureWithChoices.push(question);
        break;
      case 'published_choiceless':
        publishedChoiceless.push(question);
        break;
      case 'future_choiceless':
        futureChoiceless.push(question);
        break;
      default:
        break;
    }
  });

  return {
    publishedWithVotes,
    futureWithChoices,
    publishedChoiceless,
    futureChoiceless
  };
};

/**
 * Get color scheme for a question card based on its type
 * @param {string} type - Question type ('published' or 'future')
 * @param {boolean} hasChoices - Whether the question has choices
 * @returns {string} - Color name for the card
 */
export const getQuestionCardColor = (type, hasChoices) => {
  switch (type) {
    case 'published': return hasChoices ? 'green' : 'red';
    case 'future': return hasChoices ? 'blue' : 'orange';
    default: return 'gray';
  }
};
