import { useState } from 'react';

function Poll({ poll, onVote }) {
  const [selectedChoice, setSelectedChoice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedChoice) {
      onVote(poll.id, selectedChoice);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', margin: '10px' }}>
      <h3>{poll.question}</h3>
      <form onSubmit={handleSubmit}>
        {poll.choices.map((choice) => (
          <div key={choice.id}>
            <label>
              <input
                type="radio"
                value={choice.id}
                checked={selectedChoice === choice.id}
                onChange={(e) => setSelectedChoice(e.target.value)}
              />
              {choice.choice_text} ({choice.votes} votes)
            </label>
          </div>
        ))}
        <button type="submit" disabled={!selectedChoice}>
          Vote
        </button>
      </form>
    </div>
  );
}

export default Poll;