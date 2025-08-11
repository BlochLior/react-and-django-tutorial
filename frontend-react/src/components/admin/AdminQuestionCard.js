import React from 'react';
import { Link } from 'react-router-dom';

function AdminQuestionCard({ question }) {
  return (
    <div className="admin-question-card">
      <h4>{question.question_text}</h4>
      <div className="admin-actions">
        <Link to={`/admin/questions/${question.id}`}>
          <button>Edit</button>
        </Link>
        <Link to={`/admin/results/${question.id}`}>
          <button>View Results</button>
        </Link>
      </div>
    </div>
  );
}

export default AdminQuestionCard;
