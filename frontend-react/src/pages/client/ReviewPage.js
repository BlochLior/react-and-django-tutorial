function ReviewPage({ questions, selectedAnswers, onSubmit }) {
  const getChoiceText = (questionId, choiceId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return 'Choice not found';
    const choice = question.choices.find(c => c.id === choiceId);
    return choice ? choice.choice_text : 'Choice not found';
  };

  return (
    <div className="review-page">
      <h2>Review Your Answers</h2>
      {questions.map(question => (
        <div key={question.id}>
          <h4>{question.question_text}</h4>
          {selectedAnswers[question.id] ? (
            <p>Your answer: {getChoiceText(question.id, selectedAnswers[question.id])}</p>
          ) : (
            <p>No answer selected</p>
          )}
        </div>
      ))}
      <button onClick={onSubmit}>Submit Votes</button>
    </div>
  );
}

export default ReviewPage;