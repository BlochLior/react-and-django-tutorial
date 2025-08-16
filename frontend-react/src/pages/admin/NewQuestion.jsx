import React from 'react';
import useQuestionFormLogic from '../../components/admin/hooks/useQuestionFormLogic';
import { useNavigate } from 'react-router-dom';
import QuestionForm from '../../components/admin/QuestionForm';
import axios from 'axios';

const NewQuestion = () => {
    const navigate = useNavigate();

    const handleApiSubmit = async (formData) => {
        await axios.post('http://127.0.0.1:8000/admin/create/', formData);
        navigate('/admin/');
    };

    const {
        questionText,
        setQuestionText,
        choices,
        pubDate,
        setPubDate,
        adjustDateTime,
        handleAddChoice,
        handleRemoveChoice,
        handleChoiceChange,
        noChoicesNote,
        futureDateNote,
        isSubmitDisabled,
        handleFormSubmit,
        loading,
        error,
    } = useQuestionFormLogic(undefined, handleApiSubmit);

    return (
        <QuestionForm
            title="Create New Question"
            questionText={questionText}
            setQuestionText={setQuestionText}
            choices={choices}
            pubDate={pubDate}
            setPubDate={setPubDate}
            adjustDateTime={adjustDateTime}
            handleAddChoice={handleAddChoice}
            handleRemoveChoice={handleRemoveChoice}
            handleChoiceChange={handleChoiceChange}
            onSubmit={handleFormSubmit}
            isSubmitDisabled={isSubmitDisabled}
            noChoicesNote={noChoicesNote}
            futureDateNote={futureDateNote}
            error={error}
            submitButtonText={loading ? 'Submitting...' : 'Submit Question'}
        />
    );
};

export default NewQuestion;