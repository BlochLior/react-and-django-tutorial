import React from 'react';

function ReviewPage({ questions, selectedAnswers, onSubmit }) {
    // Filter questions into answered and unanswered lists
    const answeredQuestions = questions.filter(
        (q) => selectedAnswers[q.id] !== undefined
    );
    const unansweredQuestions = questions.filter(
        (q) => selectedAnswers[q.id] === undefined
    );

    const getChoiceText = (questionId, choiceId) => {
        const question = questions.find((q) => q.id === questionId);
        if (!question) return 'Choice not found';
        const choice = question.choices.find((c) => c.id === choiceId);
        return choice ? choice.choice_text : 'Choice not found';
    };

    return (
        <div className="review-page">
            <h2>Review Your Answers</h2>

            {/* Display answered questions */}
            <h3>Answered Questions</h3>
            {answeredQuestions.length > 0 ? (
                answeredQuestions.map((question) => (
                    <div key={question.id}>
                        <h4>{question.question_text}</h4>
                        <p>
                            Your answer:{' '}
                            {getChoiceText(question.id, selectedAnswers[question.id])}
                        </p>
                    </div>
                ))
            ) : (
                <p>You haven't answered any questions yet.</p>
            )}

            <hr />

            {/* Display a list of unanswered questions */}
            <h3>Unanswered Questions</h3>
            {unansweredQuestions.length > 0 ? (
                <ul>
                    {unansweredQuestions.map((question) => (
                        <li key={question.id}>{question.question_text}</li>
                    ))}
                </ul>
            ) : (
                <p>All questions have been answered!</p>
            )}

            <hr />

            <button onClick={onSubmit}>Submit Votes</button>
        </div>
    );
}

export default ReviewPage;