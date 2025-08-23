import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionForm from '../../components/admin/QuestionForm.jsx';
import useQuestionFormLogic from '../../components/admin/hooks/useQuestionFormLogic.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/admin/questions/';

const QuestionDetail = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [fetchedData, setFetchedData] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Fetch data for the initial state of the form
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}${questionId}/`);
                setFetchedData(response.data);
            } catch (err) {
                setFetchError('Error: Failed to fetch question.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchQuestion();
    }, [questionId]);
    
    // Define the update handler to pass to the hook
    const handleUpdate = async (formData) => {
        await axios.put(`${API_BASE_URL}${questionId}/`, formData);
        navigate('/admin/');
    };

    // Deletion handler (DELETE)
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.delete(`${API_BASE_URL}${questionId}/`);
                navigate('/admin/');
            } catch (err) {
                // We'll set a local error for deletion in this case
                console.error('Error: Failed to delete question.', err);
                setFetchError('Error: Failed to delete question.');
            }
        }
    };
    
    // Use the custom hook with the fetched data and the update handler
    const {
        questionText, setQuestionText,
        choices, handleAddChoice, handleRemoveChoice, handleChoiceChange,
        pubDate, setPubDate, adjustDateTime,
        noChoicesNote, futureDateNote,
        isSubmitDisabled, handleFormSubmit,
        loading: isSubmitting,
        error: submissionError,
    } = useQuestionFormLogic(fetchedData, handleUpdate);

    // Conditional rendering for initial data fetch
    if (isFetching) {
        return <div className="question-form-container"><h1>Loading...</h1></div>;
    }
    if (fetchError) {
        return <div className="question-form-container"><p className="error-message">{fetchError}</p></div>;
    }

    return (
        <QuestionForm
            title="Edit Question"
            onSubmit={handleFormSubmit}
            questionText={questionText}
            setQuestionText={setQuestionText}
            pubDate={pubDate}
            setPubDate={setPubDate}
            adjustDateTime={adjustDateTime}
            choices={choices}
            handleChoiceChange={handleChoiceChange}
            handleAddChoice={handleAddChoice}
            handleRemoveChoice={handleRemoveChoice}
            noChoicesNote={noChoicesNote}
            futureDateNote={futureDateNote}
            error={submissionError}
            isSubmitDisabled={isSubmitDisabled}
            submitButtonText={isSubmitting ? 'Saving...' : 'Save Changes'}
            deleteButton={
                <button type="button" onClick={handleDelete} className="delete-button">
                    Delete Question
                </button>
            }
        />
    );
};

export default QuestionDetail;