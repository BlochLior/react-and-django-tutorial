import React from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import './QuestionForm.css';

const QuestionForm = ({
  title,
  onSubmit,
  questionText,
  setQuestionText,
  pubDate,
  setPubDate,
  adjustDateTime,
  choices,
  handleChoiceChange,
  handleAddChoice,
  handleRemoveChoice,
  noChoicesNote,
  futureDateNote,
  error,
  isSubmitDisabled,
  deleteButton = null,
  submitButtonText = 'Submit Question',
}) => {
  const [datePart, timePart] = pubDate ? pubDate.split('T') : ['', ''];
  const hour = timePart ? timePart.substring(0, 2) : '00';
  const minute = timePart ? timePart.substring(3, 5) : '00';

  return (
    <div className="question-form-container">
      <h1>{title}</h1>
      <form onSubmit={onSubmit}>
        {/* Question Text Input */}
        <div className="form-group">
          <label htmlFor="questionText">Question Text:</label>
          <input
            id="questionText"
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="required"
            required
          />
        </div>

        {/* Publication Date Input with Arrows */}
        <div className="form-group date-time-picker">
          <label htmlFor="pubDate">Publication Date:</label>
          <div className="date-time-controls">
            <input
              id="pubDate"
              type="date"
              value={pubDate.split('T')[0]}
              onChange={(e) => setPubDate(`${e.target.value}T${pubDate.split('T')[1]}`)}
            />
            <div className="time-adjuster">
              <div className="time-unit">
                <button type="button" onClick={() => adjustDateTime('hour', 1)} aria-label="Increment hour"><FaChevronUp /></button>
                <span aria-label="Current hour">{hour}h</span>
                <button type="button" onClick={() => adjustDateTime('hour', -1)} aria-label="Decrement hour"><FaChevronDown /></button>
              </div>
              <div className="time-unit">
                <button type="button" onClick={() => adjustDateTime('minute', 1)} aria-label="Increment minute"><FaChevronUp /></button>
                <span aria-label="Current minute">{minute}m</span>
                <button type="button" onClick={() => adjustDateTime('minute', -1)} aria-label="Decrement minute"><FaChevronDown /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Choices Input */}
        <div className="form-group">
          <h4>Choices:</h4>
          {choices.map((choice, index) => (
            <div key={choice.id || `new-${index}`} className="choice-input-group">
              <label htmlFor={`choice-${index + 1}`}>Choice {index + 1}:</label>
              <input
                id={`choice-${index + 1}`}
                type="text"
                value={choice.choice_text}
                onChange={(e) => handleChoiceChange(e, index)}
              />
              {choices.length > 1 && (
                <button type="button" onClick={() => handleRemoveChoice(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddChoice}>Add Choice</button>
        </div>

        {/* Notes section */}
        <div className="notes">
          {noChoicesNote && (
            <p className="note">{noChoicesNote}</p>
          )}
          {futureDateNote && (
            <p className="note">{futureDateNote}</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button type="submit" disabled={isSubmitDisabled}>
            {submitButtonText}
          </button>
          {deleteButton}
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;