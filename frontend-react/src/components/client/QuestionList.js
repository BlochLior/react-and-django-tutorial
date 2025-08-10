import React from 'react';
import QuestionCard from './QuestionCard';

function QuestionList({ questions, selectedAnswers, onAnswerChange }) {
  if (!questions || questions.length === 0) {
    return <div>No polls available at the moment.</div>;
  }
  
  return (
    <div className="question-list">
      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          selectedAnswer={selectedAnswers[question.id]}
          // Pass the onAnswerChange prop down to the QuestionCard
          onAnswerChange={onAnswerChange}
        />
      ))}
    </div>
  );
}

export default QuestionList;