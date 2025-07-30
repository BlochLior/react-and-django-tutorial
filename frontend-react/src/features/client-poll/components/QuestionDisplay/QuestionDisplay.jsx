import React from 'react';
import styles from './QuestionDisplay.module.css';

function QuestionDisplay({ question, selectedChoiceId, onSelectChoice }) {
    return (
        <div>
            <h2 id={`question-${question.id}`}>{question.question_text}</h2>
            <div role="radiogroup" aria-labelledby={`question-${question.id}`}>
                {question.choices.map(choice => (
                    <div 
                        key={choice.id}
                        className={`${styles.choiceContainer} ${choice.id === selectedChoiceId ? styles.selectedChoice : ''}`}
                    >
                        <input 
                        type="radio" 
                        id={`choice-${choice.id}`} 
                        name={`question-${question.id}`} // All radio buttons for one question share the same name
                        value={choice.id} 
                        checked={choice.id === selectedChoiceId}
                        onChange={() => {
                            onSelectChoice && onSelectChoice(choice.id)
                        }}
                        />
                        <label htmlFor={`choice-${choice.id}`}>{choice.choice_text}</label>
                    </div>    
                ))}
            </div>
        </div>
    );
}

export default QuestionDisplay