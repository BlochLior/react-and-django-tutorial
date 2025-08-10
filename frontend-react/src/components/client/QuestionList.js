import QuestionCard from './QuestionCard';

function QuestionList({ questions }) {
  return (
    <div className="question-list">
      {questions.length > 0 ? (
        questions.map(question => (
          <QuestionCard key={question.id} question={question} />
        ))
      ) : (
        <p>No polls available at the moment.</p>
      )}
    </div>
  );
}

export default QuestionList;