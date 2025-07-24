import React, { useState, useEffect } from 'react';
import { pollService } from '../services/api';


function PollList() {
  const [polls, setPolls] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    pollService.getAllPolls()
      .then(data => {
        console.log('API data:', data);
        setPolls(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
    
    // Real API call would be:
    // pollService.getAllPolls()
    //   .then(data => {
    //     console.log('API data:', data);
    //     setPolls(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //     setLoading(false);
    //   });
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
      // Here you'd send all answers to your Django backend at once
      console.log('Submitting answers:', answers);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Real API call would be something like:
      // await pollService.submitAllAnswers(answers);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting poll. Please try again.');
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
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${((currentStep + 1) / polls.length) * 100}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Current Question */}
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        backgroundColor: '#fafafa'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
          {currentPoll.question}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentPoll.choices?.map((choice) => (
            <label 
              key={choice.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: answers[currentPoll.id] == choice.id ? '#e3f2fd' : 'white',
                borderColor: answers[currentPoll.id] == choice.id ? '#2196F3' : '#e0e0e0',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name={`poll-${currentPoll.id}`}
                value={choice.id}
                checked={answers[currentPoll.id] == choice.id}
                onChange={() => handleAnswerChange(currentPoll.id, choice.id)}
                style={{ marginRight: '0.75rem' }}
              />
              <span style={{ fontSize: '1rem' }}>{choice.choice_text}</span>
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
            backgroundColor: currentStep === 0 ? '#ccc' : '#f0f0f0',
            border: '1px solid #ddd',
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
                backgroundColor: index === currentStep ? '#2196F3' : 
                                answers[polls[index].id] ? '#4CAF50' : '#e0e0e0'
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
              backgroundColor: !isCurrentQuestionAnswered() ? '#ccc' : '#2196F3',
              color: 'white',
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
              backgroundColor: !allQuestionsAnswered() || submitting ? '#ccc' : '#4CAF50',
              color: 'white',
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

export default PollList;