import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../../components/ui/Pagination'; // Will be created later
import QuestionList from '../../components/client/QuestionList'; // TODO: currently don't have a client subfolder, need to think if should be added


function PollsContainer() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({})
  const [selectedAnswers, setSelectedAnswers] = useState({});

  
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get(`/polls/?page=${currentPage}`);
        setPolls(response.data.results);
        setPaginationInfo(response.data);
      } catch (error) {
        setError('Failed to fetch polls');
        console.error(error)
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [currentPage]);

  const handleAnswerChange = (questionId, choiceId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  if (loading) {
    return <div>Loading polls...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <h1>Available Polls</h1>
      <QuestionList 
        questions={polls}
        onAnswerChange={handleAnswerChange}
        selectedAnswers={selectedAnswers}
      />
      <Pagination
        currentPage={paginationInfo.page}
        totalPages={paginationInfo.total_pages}
        onPageChange={handlePageChange}
        hasPrevious={!!paginationInfo.previous}
        hasNext={!!paginationInfo.next}
      />
    </div>
  );
}

export default PollsContainer;