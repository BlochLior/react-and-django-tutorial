const API_BASE_URL = 'http://127.0.0.1:8000/polls/api';

export const pollService = {
  // Get all questions - matches question_list_api view from django backend
  getAllPolls: () => fetch(`${API_BASE_URL}/questions/`).then(res => res.json()),
  
  // Submit individual votes - we'll call this for each answer
  submitVote: (questionId, choiceId) => fetch(`${API_BASE_URL}/questions/${questionId}/vote/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice_id: choiceId })
  }).then(res => res.json())
};