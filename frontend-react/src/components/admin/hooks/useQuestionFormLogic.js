import { useState, useEffect } from 'react';
import { format, parseISO, isFuture } from 'date-fns';

const useQuestionFormLogic = (initialData = null, onSubmit) => {
    // Initialize with default values for the first render
    const [questionText, setQuestionText] = useState('');
    const [choices, setChoices] = useState([{ choice_text: '' }, { choice_text: '' }]);
    const [pubDate, setPubDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use a useEffect to synchronize the form state with the fetched initialData
    useEffect(() => {
        console.log('useEffect triggered. Initial Data:', initialData);
        if (initialData) {
            setQuestionText(initialData.question_text || '');
            setChoices(initialData.choices || []);
    
            const dateToFormat = initialData.pub_date ? parseISO(initialData.pub_date) : new Date();
            // Change this line to match the UTC format
            setPubDate(format(dateToFormat, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
        }
    }, [initialData]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const filteredChoices = choices.filter(choice => choice.choice_text.trim() !== '');
            await onSubmit({
                question_text: questionText,
                choices: filteredChoices,
                pub_date: pubDate,
            });
        } catch (err) {
            console.error('Submission failed:', err);
            setError('Failed to submit question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Validation logic
    const hasChoices = choices.length > 0;
    const allChoicesEmpty = choices.every(c => c.choice_text.trim() === '');

    // Notes based on different conditions
    let noChoicesNote = null;
    let futureDateNote = null;

    if (!hasChoices || allChoicesEmpty) {
        noChoicesNote = "Note: Current question has no choices.";
    }

    const pubDateObj = parseISO(pubDate);
    if (isFuture(pubDateObj)) {
        futureDateNote = `Note: Current question is set to publish on ${format(pubDateObj, 'yyyy-MM-dd', { timeZone: 'UTC' })} at ${format(pubDateObj, 'HH:mm', { timeZone: 'UTC' })}`;
    }

    // Submission disabled if:
    // 1. question text is empty
    // 2. there are choices, but at least one is empty
    const isSubmitDisabled = !questionText || loading;
    
    const adjustDateTime = (unit, amount) => {
        if (!pubDate) return;
        const newDate = parseISO(pubDate);
        if (unit === 'hour') newDate.setUTCHours(newDate.getUTCHours() + amount);
        if (unit === 'minute') newDate.setUTCMinutes(newDate.getUTCMinutes() + amount);
        setPubDate(format(newDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    };

    const handleAddChoice = () => setChoices([...choices, { choice_text: '' }]);
    const handleRemoveChoice = (index) => setChoices(choices.filter((_, i) => i !== index));
    const handleChoiceChange = (e, index) => {
        const newChoices = [...choices];
        newChoices[index].choice_text = e.target.value;
        setChoices(newChoices);
    };

    return {
        questionText, setQuestionText,
        choices, setChoices,
        pubDate, setPubDate,
        adjustDateTime,
        handleAddChoice,
        handleRemoveChoice,
        handleChoiceChange,
        noChoicesNote,
        futureDateNote,
        handleFormSubmit,
        isSubmitDisabled,
        loading,
        error,
    };
};

export default useQuestionFormLogic;