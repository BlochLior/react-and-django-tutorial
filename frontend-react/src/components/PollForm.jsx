import React, { useState, useEffect } from 'react';
import { pollService } from '../services/api';

function PollForm() {
  const [polls, setPolls] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    pollService.getAllPolls()
      .then(data => {
        console.log('API data:', data);
        setPolls(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching polls:', error);
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (pollId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [pollId]: choiceId
    }));
  };

  const goToNext = () => {
    if (currentStep < polls.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      console.log('Submitting answers:', answers);
      
      // Submit each vote individually to my existing vote API
      const votePromises = Object.entries(answers).map(([questionId, choiceId]) => {
        return pollService.submitVote(questionId, choiceId);
      });
      
      // Wait for all votes to complete
      const results = await Promise.all(votePromises);
      console.log('All votes submitted:', results);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting votes:', error);
      setError('Error submitting poll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    return answers[polls[currentStep]?.id] !== undefined;
  };

  const allQuestionsAnswered = () => {
    return polls.every(poll => answers[poll.id] !== undefined);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading poll questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Thank you!</h2>
        <p>Your responses have been submitted successfully.</p>
        <button onClick={() => window.location.reload()}>
          Take Another Poll
        </button>
      </div>
    );
  }

  if (polls.length === 0) {
    return <div>No poll questions available.</div>;
  }

  const currentPoll = polls[currentStep];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span>Question {currentStep + 1} of {polls.length}</span>
          <span>{Math.round(((currentStep + 1) / polls.length) * 100)}% complete</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${((currentStep + 1) / polls.length) * 100}%`,
            height: '100%',
            backgroundColor: '#28a745',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Current Question */}
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        backgroundColor: 'white'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#222' }}>
          {currentPoll.question_text}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentPoll.choices?.map((choice) => (
            <label 
              key={choice.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '1rem',
                border: '2px solid #ddd',
                borderRadius: '6px',
                backgroundColor: answers[currentPoll.id] == choice.id ? '#e8f5e8' : 'white',
                borderColor: answers[currentPoll.id] == choice.id ? '#4CAF50' : '#ddd',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name={`poll-${currentPoll.id}`}
                value={choice.id}
                checked={answers[currentPoll.id] == choice.id}
                onChange={() => handleAnswerChange(currentPoll.id, choice.id)}
                style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
              />
              <span style={{ fontSize: '1rem', color: '#333' }}>{choice.choice_text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={goToPrevious}
          disabled={currentStep === 0}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentStep === 0 ? '#e0e0e0' : 'white',
            color: currentStep === 0 ? '#999' : '#333',
            border: '2px solid #ddd',
            borderRadius: '4px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {polls.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#007bff' : 
                                answers[polls[index].id] ? '#28a745' : '#ddd'
              }}
            />
          ))}
        </div>

        {currentStep < polls.length - 1 ? (
          <button
            onClick={goToNext}
            disabled={!isCurrentQuestionAnswered()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: !isCurrentQuestionAnswered() ? '#e0e0e0' : '#007bff',
              color: !isCurrentQuestionAnswered() ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isCurrentQuestionAnswered() ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered() || submitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: !allQuestionsAnswered() || submitting ? '#e0e0e0' : '#28a745',
              color: !allQuestionsAnswered() || submitting ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !allQuestionsAnswered() || submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Poll'}
          </button>
        )}
      </div>

      {/* Debug Info */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <strong>Debug Info:</strong>
        <br />
        Current answers: {JSON.stringify(answers, null, 2)}
      </div>
    </div>
  );
}

export default PollForm;