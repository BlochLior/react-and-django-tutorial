function QuestionCard({ question, onAnswerChange, selectedChoice }) {
    const handleChange = (e) => {
        const choiceId = parseInt(e.target.value, 10)
        onAnswerChange(question.id, choiceId);
    };
    return (
      <div className="question-card">
        <h4>{question.question_text}</h4>
        <form>
          {question.choices.map(choice => (
            <div key={choice.id}>
              <input
                type="radio"
                id={`choice-${choice.id}`}
                name={`question-${question.id}`}
                value={choice.id}
                checked={selectedChoice === choice.id}
                onChange={handleChange}
              />
              <label htmlFor={`choice-${choice.id}`}>
                {choice.choice_text}
              </label>
            </div>
          ))}
        </form>
      </div>
    );
}

export default QuestionCard;