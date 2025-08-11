import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { format } from 'date-fns';
import './NewQuestionForm.css'; // Assuming you have a CSS file for styling

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';

const NewQuestionForm = () => {
  const navigate = useNavigate();
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState([{ choice_text: '' }, { choice_text: '' }]);
  const [pubDate, setPubDate] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatNoteDate = () => {
    const now = new Date();
    const pub = new Date(pubDate);

    const formatShort = (date) => format(date, 'MMMM d');
    const formatTime = (date) => format(date, 'h:mm a z');

    if (pub <= now) return null;

    let diff = Math.abs(pub - now);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    diff -= years * (1000 * 60 * 60 * 24 * 365);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    diff -= months * (1000 * 60 * 60 * 24 * 30);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeDiff = [];
    if (years > 0) timeDiff.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) timeDiff.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) timeDiff.push(`${days} day${days > 1 ? 's' : ''}`);
    if (years === 0 && months === 0 && days === 0) {
      if (hours > 0) timeDiff.push(`${hours} hour${hours > 1 ? 's' : ''}`);
      if (minutes > 0) timeDiff.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    const formattedDate = formatShort(pub);
    const formattedTime = formatTime(pub);
    const isThisYear = format(now, 'yyyy') === format(pub, 'yyyy');
    
    let note = `Current question is set to publish on ${formattedDate}`;
    if (!isThisYear) {
      note += `, ${format(pub, 'yyyy')}`;
    }
    note += ` at ${formattedTime}`;

    if (timeDiff.length > 0) {
      note += `, in ${timeDiff.join(', ')}`;
    }
    
    return note;
  };

  const adjustDateTime = (unit, amount) => {
    const newDate = new Date(pubDate);
    if (unit === 'hour') newDate.setHours(newDate.getHours() + amount);
    if (unit === 'minute') newDate.setMinutes(newDate.getMinutes() + amount);
    setPubDate(format(newDate, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleAddChoice = () => setChoices([...choices, { choice_text: '' }]);
  const handleRemoveChoice = (index) => setChoices(choices.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const filteredChoices = choices.filter(choice => choice.choice_text.trim() !== '');

    const data = {
      question_text: questionText,
      pub_date: new Date(pubDate).toISOString(),
      choices: filteredChoices,
    };

    try {
      await axios.post(`${API_BASE_URL}admin/create/`, data);
      setLoading(false);
      navigate('/admin');
    } catch (err) {
      setError('Error: Failed to submit question.');
      setLoading(false);
    }
  };

  const hasChoices = choices.some(choice => choice.choice_text.trim() !== '');
  const isFutureDate = new Date(pubDate) > new Date();
  const futureDateNote = isFutureDate ? formatNoteDate() : null;

  return (
    <div className="new-question-form-container">
      <h1>Create New Question</h1>
      <form onSubmit={handleSubmit}>
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
                <span aria-label="Current hour">{pubDate.split('T')[1].substring(0, 2)}h</span>
                <button type="button" onClick={() => adjustDateTime('hour', -1)} aria-label="Decrement hour"><FaChevronDown /></button>
              </div>
              <div className="time-unit">
                <button type="button" onClick={() => adjustDateTime('minute', 1)} aria-label="Increment minute"><FaChevronUp /></button>
                <span aria-label="Current minute">{pubDate.split('T')[1].substring(3, 5)}m</span>
                <button type="button" onClick={() => adjustDateTime('minute', -1)} aria-label="Decrement minute"><FaChevronDown /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <h4>Choices:</h4>
          {choices.map((choice, index) => (
            <div key={index} className="choice-input-group">
              <label htmlFor={`choice-${index + 1}`}>Choice {index + 1}:</label>
              <input
                id={`choice-${index + 1}`}
                type="text"
                value={choice.choice_text}
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[index].choice_text = e.target.value;
                  setChoices(newChoices);
                }}
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

        <div className="notes">
          {!hasChoices && (
            <p className="note">Note: Current question has no choices, and as such not viewed on client view.</p>
          )}
          {futureDateNote && (
            <p className="note">Note: {futureDateNote}</p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
};

export default NewQuestionForm;