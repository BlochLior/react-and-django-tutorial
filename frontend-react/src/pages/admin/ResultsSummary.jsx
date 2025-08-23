import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsSummary.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';

const ResultsSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}admin/summary/`);
        setSummary(response.data);
      } catch (err) {
        setError('Failed to fetch poll results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []); 

  if (loading) {
    return <div className="results-container">Loading results...</div>;
  }

  if (error) {
    return <div className="results-container error">{error}</div>;
  }

  if (!summary || summary.questions_results.length === 0) {
    return <div className="results-container">No results to display.</div>;
  }

  return (
    <div className="results-container">
      <h1>Overall Poll Results</h1>
      <p>Total Questions: {summary.total_questions}</p>
      <p>Total Votes Across All Questions: {summary.total_votes_all_questions}</p>

      {summary.questions_results.map((questionData, index) => (
        <div key={questionData.id || index} className="question-results-card">
          <h2>{questionData.question_text}</h2>
          {questionData.choices.length > 0 ? (
            <ul className="results-list">
              {questionData.choices.map((choice, choiceIndex) => {
                const percentage = questionData.total_votes > 0 
                  ? ((choice.votes / questionData.total_votes) * 100).toFixed(0) 
                  : 0;

                return (
                  <li key={choice.id || choiceIndex} className="results-item">
                    <div className="choice-text">{choice.choice_text}</div>
                    <div className="vote-count">{choice.votes} votes</div>
                    <div className="percentage-bar-container">
                      <div className="percentage-bar" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="percentage-text">{percentage}%</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="no-choices-note">No choices found for this question.</p>
          )}

        </div>
      ))}
    </div>
  );
};


export default ResultsSummary;