import React from 'react';

function QuestionCard({ question, selectedAnswer, onAnswerChange }) {
  const handleChange = (choiceId) => {
    // Call the onAnswerChange function with the questionId and the new choiceId
    onAnswerChange(question.id, choiceId);
  };

  return (
    <div className="question-card">
      <h4>{question.question_text}</h4>
      <ul>
        {question.choices.map(choice => (
          <li key={choice.id}>
            <label>
              <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={String(choice.id)}
                  checked={selectedAnswer === choice.id}
                  onChange={() => handleChange(choice.id)}
                />
                {choice.choice_text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionCard;