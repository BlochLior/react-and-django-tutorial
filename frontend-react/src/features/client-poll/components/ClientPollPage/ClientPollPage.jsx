import React, { useState, useEffect } from 'react';

import QuestionDisplay from '../QuestionDisplay/QuestionDisplay';

function ClientPollPage({ pollId }) {
    // State to hold the entire poll data
    const [poll, setPoll] = useState(null);
    // State for loading status
    const [loading, setLoading] = useState(true);
    // State to hold any error that might occur
    const [error, setError] = useState(null);
    // State to hold selected choice IDs for multiple questions
    // this state will be an object wherein question IDs are keys,
    // and selected choice IDs are values
    const [answers, setAnswers] = useState({});
    
    // State for submission status and messages
    const [submitting, setSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    
    // useEffect hook to fetch data when the component mounts for pollId changes
    useEffect(() => {
        // if no pollId is provided, immediately show an error
        if (!pollId) {
            setError('No poll ID provided');
            setLoading(false);
            return;
        }
        const fetchPollData = async () => {
            setLoading(true); // Start loading
            setError(null); // Reset error
            setSubmissionError(null); // Reset submission error
            setSubmissionMessage(null); // Reset submission message

            try {
                const response = await fetch(`/api/polls/${pollId}/`); // Make the API call
                if (!response.ok) {
                    // If response is not ok (404, 500 etc.), throw an error
                    const errorData = await response.json(); // Try to parse the error data
                    throw new Error(`Error loading poll: ${errorData.detail || response.statusText || response.status}`);
                }
                const data = await response.json(); // Parse the JSON response
                setPoll(data); // Set the fetched poll data
            } catch (err) {
                // Catch any network errors or errors thrown above
                console.error("Failed to fetch poll:", err);
                setError(err.message || "Failed to fetch poll"); // Set the error state
            } finally {
                setLoading(false); // Stop loading regardless of success or failure
            }
        };
        fetchPollData(); // Call the function to fetch data when the effect runs
    }, [pollId]); // Dependency array: re-run this effect only if pollId changes

    // Handler function to update the answers state
    const handleSelectChoice = (questionId, choiceId) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: choiceId,
        }));
        setSubmissionError(null); // Reset submission error on choice selection
        setSubmissionMessage(null); // Reset submission message on choice selection
    };

    // Function to handle the vote submission
    const handleSubmitVote = async () => {
        // Submit button disabled if no questions have been answered
        if (Object.keys(answers).length === 0) {
            setSubmissionError("Please select a choice before submitting");
            return;
        }
        
        setSubmitting(true); // Start submitting
        setSubmissionError(null); // Reset submission error
        setSubmissionMessage(null); // Reset submission message

        try {
            const response = await fetch(`/api/polls/${pollId}/vote/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // If the django backend requires a CSRF token for POST,
                // it will be needed to be fetched here, using a creation of a helper function
                // like getCookie:
                // 'X-CSRFToken': getCookie('csrftoken'),
                body: JSON.stringify({ answers: answers }),
            });
            if (!response.ok) {
                // Handling of non-2xx responses
                const errorData = await response.json();
                throw new Error(`Submission failed: ${errorData.detail || response.statusText || response.status}`);
            }

            // Assuming a successful response, that might contain a message or updated data
            const data = await response.json();
            setSubmissionMessage(data.message || "Vote submitted successfully");
            setAnswers({}); // Reset answers after successful submission
        } catch (err) {
            console.error("Failed to submit vote:", err);
            setSubmissionError(err.message || "Failed to submit vote"); // Set the error state
        } finally {
            setSubmitting(false); // Stop submitting
        }
    };
    
    // Conditional rendering based on state
    if (loading) {
        return <div>Loading poll...</div>;
    }
    
    if (error) {
        return <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>Error loading poll: {error}</div>;
    }

    // If not loading, no error but still no poll data
    if (!poll || !poll.questions || poll.questions.length === 0) {
        return <div>No poll data available</div>;
    }

    // If data is successfully loaded and there's no error
    return (
        <div>
            <h1>{poll.title}</h1>
            {poll.questions.map((question) => (
                <QuestionDisplay
                    key={question.id}
                    question={question}
                    selectedChoiceId={answers[question.id]}
                    onSelectChoice={(choiceId) => handleSelectChoice(question.id, choiceId)}
                />
            ))}
            <button
                onClick={handleSubmitVote}
                // Button is diabled if: 
                // 1. No choice is selected (selectedChoiceId is null)
                // 2. The button is currently submitting (submitting is true)
                disabled={Object.keys(answers).length === 0 || submitting}
            >
                {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
            {/* Display submission feedback messages */}
            {submissionMessage && <div style={{ color: 'green', marginTop: '10px'}}>{submissionMessage}</div>}
            {submissionError && <div style={{ color: 'red', marginTop: '10px' }}>{submissionError}</div>}
        </div>
    )
}


export default ClientPollPage;
