import React, { useState, useEffect } from 'react';

import QuestionDisplay from '../QuestionDisplay/QuestionDisplay';

function ClientPollPage({ pollId }) {
    // State to hold the question data
    const [question, setQuestion] = useState(null);
    // State for loading status
    const [loading, setLoading] = useState(true);
    
    // State to hold any error that might occur
    const [error, setError] = useState(null);
    
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

            try {
                const response = await fetch(`/api/polls/${pollId}/`); // Make the API call
                if (!response.ok) {
                    // If response is not ok (404, 500 etc.), throw an error
                    const errorData = await response.json(); // Try to parse the error data
                    throw new Error(`Error loading poll: ${errorData.detail || response.statusText || response.status}`);
                }
                const data = await response.json(); // Parse the JSON response
                setQuestion(data); // Set the fetched question data
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
    
    // Conditional rendering based on state
    if (loading) {
        return <div>Loading poll...</div>;
    }
    
    if (error) {
        return <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>Error loading poll: {error}</div>;
    }

    // If not loading, no error but still no question (e.g. API returned empty data)
    if (!question) {
        return <div>No poll data available</div>;
    }

    // If data is successfully loaded and there's no error
    return (
        <div>
            <QuestionDisplay
                question={question}
                selectedChoiceId={null} // ClientPollPage will manage this state later
                onSelectChoice={() => {}} // ClientPollPage will manage this handler later
            />
        </div>
    )
}


export default ClientPollPage;
