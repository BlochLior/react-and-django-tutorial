import React from 'react';
import AdminQuestionCard from './AdminQuestionCard';

function AdminQuestionList({ questions }) {
  if (!questions || questions.length === 0) {
    return <div>No questions available.</div>;
  }
  
  return (
    <div className="admin-question-list">
      {questions.map(question => (
        <AdminQuestionCard
          key={question.id}
          question={question}
        />
      ))}
    </div>
  );
}

export default AdminQuestionList;