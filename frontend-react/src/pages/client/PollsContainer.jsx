import { useState, useCallback, useEffect } from 'react';
import {
    Box,
    VStack,
    Heading,
    Button,
    Center
} from '@chakra-ui/react';
import { FaEye } from 'react-icons/fa';
import Pagination from '../../components/ui/Pagination';
import QuestionList from '../../components/client/QuestionList';
import ReviewPage from './ReviewPage';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pollsApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import useQuery from '../../hooks/useQuery';
import useMutation from '../../hooks/useMutation';

function PollsContainer() {

    // State for pagination information
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        total_pages: null,
        hasPrevious: false,
        hasNext: false,
    });
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const [initialAnswersLoaded, setInitialAnswersLoaded] = useState(false);

    // Dynamic title based on current state
    usePageTitle(isReviewing ? 'Review Answers - Polling App' : 'Polls - Polling App');

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    // Create stable query functions
    const getPollsQuery = useCallback(async () => {
        return pollsApi.getPolls(currentPage);
    }, [currentPage]);

    // Create stable query function for fetching all polls for review and submit votes
    const getAllPollsQuery = useCallback(async () => {
        return pollsApi.getAllPolls();
    }, []);

    // Memoize the onSuccess callback to prevent infinite re-renders
    const onPollsSuccess = useCallback((data) => {
        setPaginationInfo({
            page: data.page,
            total_pages: data.total_pages,
            hasPrevious: !!data.previous,
            hasNext: !!data.next,
        });
    }, []);

    // Using custom query hook for data fetching
    const { 
        data: pollsResponse,
        loading,
        error
    } = useQuery(
        getPollsQuery,
        ['polls-paginated', currentPage],  // Unique key with page number
        { 
            errorMessage: 'Failed to fetch polls.',
            onSuccess: onPollsSuccess
        }
    );

    const polls = pollsResponse?.results || [];
    
    // Fetch user's previous votes to pre-populate
    const {
        data: userVotesResponse,
        loading: loadingUserVotes
    } = useQuery(
        async () => pollsApi.getUserVotes(),
        ['user-votes-polls-container'],  // Unique identifier for this query
        {
            errorMessage: 'Failed to fetch your previous votes.',
            enabled: true,
            refetchOnMount: true  // Always fetch fresh when entering polls page
        }
    );

    // Pre-populate selectedAnswers with user's previous votes
    useEffect(() => {
        if (userVotesResponse && !initialAnswersLoaded) {
            const previousVotes = {};
            userVotesResponse.results?.forEach(question => {
                if (question.user_selected_choice_id) {
                    previousVotes[question.id] = question.user_selected_choice_id;
                }
            });
            setSelectedAnswers(previousVotes);
            setInitialAnswersLoaded(true);
        }
    }, [userVotesResponse, initialAnswersLoaded]);

    // Using custom mutation hook for vote submission
    const [submitVotes, { error: submissionError }] = useMutation(
        pollsApi.submitVotes,
        {
            errorMessage: 'Failed to submit votes.',
            onSuccess: () => {
                navigate('/success');
            }
        }
    );

    // Using custom query hook for fetching all polls for review
    const { 
        data: allPollsResponse,
        loading: loadingAllPolls,
        error: allPollsError,
        refetch: refetchAllPolls 
    } = useQuery(
        getAllPollsQuery,
        ['all-polls-for-review'],  // Unique identifier for this query
        { 
            errorMessage: 'Failed to fetch all polls for review.',
            enabled: false // Only fetch when needed
        }
    );

    const handleReviewClick = async () => {
        // Only allow review if user has answered at least one question
        if (Object.keys(selectedAnswers).length === 0) {
            return; // Don't proceed if no answers selected
        }
        
        await refetchAllPolls(); // Wait for all polls to load
        setIsReviewing(true); // Only then, switch to review mode
    };

    const handleAnswerChange = (questionId, choiceId) => {
        setSelectedAnswers((prev) => {
            // If clicking the same choice again, remove it (deselect)
            if (prev[questionId] === choiceId) {
                const newAnswers = { ...prev };
                delete newAnswers[questionId];
                return newAnswers;
            }
            // Otherwise, select the new choice
            return {
                ...prev,
                [questionId]: choiceId,
            };
        });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    const handleVoteSubmission = async () => {
        const votes_dict = {};
        for (const questionId in selectedAnswers) {
            votes_dict[parseInt(questionId, 10)] = parseInt(selectedAnswers[questionId], 10);
        }

        await submitVotes(votes_dict);
    };

    if (loading || loadingUserVotes) {
        return (
            <LoadingState 
                message="Loading polls..." 
            />
        );
    }

    if (loadingAllPolls && isReviewing) {
        return (
            <LoadingState 
                message="Loading all questions for review..." 
            />
        );
    }

    if (error || allPollsError) {
        return <ErrorState message={error || allPollsError} />;
    }

    if (isReviewing) {
        return (
            <Box py={8}>
                <ReviewPage
                    questions={allPollsResponse?.results || []} // Pass the complete list of polls
                    selectedAnswers={selectedAnswers}
                    onSubmit={handleVoteSubmission}
                />
                {submissionError && (
                    <ErrorState message={submissionError} />
                )}
            </Box>
        );
    }

    return (
        <Box py={8}>
            <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center" color="teal.600">
                    Polls
                </Heading>
                
                <QuestionList
                    questions={polls}
                    selectedAnswers={selectedAnswers}
                    onAnswerChange={handleAnswerChange}
                />
                
                {paginationInfo.total_pages !== null && (
                    <Box display="flex" justifyContent="center">
                        <Pagination
                            currentPage={paginationInfo.page}
                            totalPages={paginationInfo.total_pages}
                            onPageChange={handlePageChange}
                            hasPrevious={paginationInfo.hasPrevious}
                            hasNext={paginationInfo.hasNext}
                            data-testid="pagination"
                        />
                    </Box>
                )}
                
                <Center>
                    <Button
                        leftIcon={<FaEye />}
                        colorScheme="teal"
                        size="lg"
                        onClick={handleReviewClick}
                        isDisabled={Object.keys(selectedAnswers).length === 0}
                        title={Object.keys(selectedAnswers).length === 0 ? "Please answer at least one question to review" : "Review your answers"}
                    >
                        Review Answers
                    </Button>
                </Center>
            </VStack>
        </Box>
    );
}

export default PollsContainer;