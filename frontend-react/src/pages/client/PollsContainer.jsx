import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../../components/ui/Pagination';
import QuestionList from '../../components/client/QuestionList';
import ReviewPage from './ReviewPage';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/polls/'

function PollsContainer() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [allPolls, setAllPolls] = useState([]);
    const [loadingAllPolls, setLoadingAllPolls] = useState(false); 

    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        total_pages: 1,
        hasPrevious: false,
        hasNext: false,
    });
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    const fetchPolls = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}?page=${page}`);
            setPolls(response.data.results);
            setPaginationInfo({
                page: response.data.page,
                total_pages: response.data.total_pages,
                hasPrevious: !!response.data.previous,
                hasNext: !!response.data.next,
            });
            setError(null);
        } catch (error) {
            setError('Error: Failed to fetch polls');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    // A separate function to fetch ALL polls for the review page
    const fetchAllPollsForReview = async () => {
        setLoadingAllPolls(true); // Start loading
        try {
            const response = await axios.get(`${API_BASE_URL}?page_size=all`);
            setAllPolls(response.data.results);
        } catch (error) {
            console.error('Error fetching all polls:', error);
            setError('Error fetching all polls for review.');
        } finally {
            setLoadingAllPolls(false); // End loading
        }
    };

    useEffect(() => {
        fetchPolls(currentPage);
    }, [currentPage]);

    const handleReviewClick = async () => {
        await fetchAllPollsForReview(); // Wait for all polls to load
        setIsReviewing(true); // Only then, switch to review mode
    };

    const handleAnswerChange = (questionId, choiceId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: choiceId,
        }));
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    const handleVoteSubmission = async () => {
        setSubmissionError(null);
        try {
            const votes_dict = {};
            for (const questionId in selectedAnswers) {
                votes_dict[parseInt(questionId, 10)] = parseInt(selectedAnswers[questionId], 10);
            }

            await axios.post(`${API_BASE_URL}vote/`, { votes: votes_dict });
            navigate('/success');
        } catch (err) {
            console.error(err);
            setSubmissionError('Error: Failed to submit votes');
        }
    };

    if (loading || loadingAllPolls) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (isReviewing) {
        return (
            <div className="polls-container">
                <ReviewPage
                    questions={allPolls} // Pass the complete list of polls
                    selectedAnswers={selectedAnswers}
                    onSubmit={handleVoteSubmission}
                />
                {submissionError && <div className="error">{submissionError}</div>}
            </div>
        );
    }

    return (
        <div className="polls-container">
            <h1>Polls</h1>
            <QuestionList
                questions={polls}
                selectedAnswers={selectedAnswers}
                onAnswerChange={handleAnswerChange}
            />
            <Pagination
                currentPage={paginationInfo.page}
                totalPages={paginationInfo.total_pages}
                onPageChange={handlePageChange}
                hasPrevious={paginationInfo.hasPrevious}
                hasNext={paginationInfo.hasNext}
            />
            <button onClick={handleReviewClick}>Review Answers</button>
        </div>
    );
}

export default PollsContainer;