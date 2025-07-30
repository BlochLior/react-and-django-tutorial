import React from 'react';

import QuestionDisplay from '../QuestionDisplay/QuestionDisplay';

function ClientPollPage({ question }) {
    // If no question data, for now show a loading state
    if (!question) {
        return <div>Loading poll...</div>;
    }
    
    // Render the QuestionDisplay component and pass it the question data
    return (
        <div>
            <QuestionDisplay 
                question={question}
                selectedChoiceId={null}
                onSelectChoice={() => {}}
            />
        </div>
    );
}

export default ClientPollPage;
