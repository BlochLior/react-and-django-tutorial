import { useParams } from 'react-router-dom';

function QuestionDetail() {
  const { pk } = useParams();
  return (
    <div>
      <h2>Question Detail for ID: {pk}</h2>
    </div>
  );
}

export default QuestionDetail;