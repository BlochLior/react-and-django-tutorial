import React from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Card,
    CardBody,
    Badge,
    HStack,
    Divider,
    Alert,
    AlertIcon,
    AlertDescription,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';
import { FaCheck, FaEdit, FaChartBar, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useQuery from '../../hooks/useQuery';
import useMutation from '../../hooks/useMutation';
import { pollsApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import usePageTitle from '../../hooks/usePageTitle';
import { useAuth } from '../../contexts/AuthContext';

/**
 * UserVotesReviewPage - Displays user's submitted votes
 * 
 * This page allows users who have already voted to:
 * - Review their submitted answers
 * - Navigate to change their answers (re-answer poll)
 * - View results
 */
function UserVotesReviewPage() {
    usePageTitle('Review Your Votes - Polling App');
    const navigate = useNavigate();
    const { refreshAuthStatus } = useAuth();
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();

    // Fetch user votes
    const {
        data: votesResponse,
        loading,
        error
    } = useQuery(
        async () => pollsApi.getUserVotes(),
        ['user-votes-review'],  // Unique identifier for this query to prevent cache collision
        {
            errorMessage: 'Failed to fetch your votes.',
            refetchOnMount: true  // Always fetch fresh data when component mounts
        }
    );

    const questions = votesResponse?.results || [];
    
    // Separate questions into answered and unanswered
    const answeredQuestions = questions.filter(q => q.user_selected_choice_id !== null && q.user_selected_choice_id !== undefined);
    const unansweredQuestions = questions.filter(q => q.user_selected_choice_id === null || q.user_selected_choice_id === undefined);

    // Mutation for deleting all votes
    const [deleteAllVotes, { loading: deletingVotes }] = useMutation(
        async () => pollsApi.submitVotes({}),
        {
            errorMessage: 'Failed to delete your votes.',
            onSuccess: () => {
                refreshAuthStatus(); // Update hasVoted status
                navigate('/'); // Return to home page
            }
        }
    );

    const handleChangeAnswers = () => {
        navigate('/polls');
    };
    
    const handleDeleteAllVotes = () => {
        onWarningOpen();
    };
    
    const handleConfirmDelete = async () => {
        onWarningClose();
        await deleteAllVotes();
    };

    const handleViewResults = () => {
        navigate('/results');
    };

    const handleReturnHome = () => {
        navigate('/');
    };

    if (loading) {
        return <LoadingState message="Loading your votes..." />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (questions.length === 0) {
        return (
            <Box py={8} maxW="4xl" mx="auto">
                <VStack spacing={6}>
                    <Heading size="lg">No Questions Available</Heading>
                    <Text>There are currently no questions available to review.</Text>
                    <Button colorScheme="teal" onClick={handleReturnHome}>
                        Return Home
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box py={8} maxW="4xl" mx="auto">
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl" textAlign="center" color="teal.600">
                    Review Your Votes
                </Heading>

                {/* Summary badges */}
                <HStack justify="center" spacing={4}>
                    <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="md">
                        <HStack spacing={2}>
                            <FaCheck />
                            <Text>{answeredQuestions.length} Answered</Text>
                        </HStack>
                    </Badge>
                    {unansweredQuestions.length > 0 && (
                        <Badge colorScheme="orange" fontSize="md" px={4} py={2} borderRadius="md">
                            <Text>{unansweredQuestions.length} Not Answered</Text>
                        </Badge>
                    )}
                </HStack>

                <Divider />

                {/* Display answered questions */}
                {answeredQuestions.length > 0 && (
                    <Box>
                        <Heading as="h2" size="lg" mb={4} color="green.600">
                            Your Answers
                        </Heading>
                        <VStack spacing={4} align="stretch">
                            {answeredQuestions.map((question) => {
                                const selectedChoice = question.choices.find(
                                    c => c.id === question.user_selected_choice_id
                                );

                                return (
                                    <Card key={question.id} variant="outline" borderColor="green.200">
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                        {question.question_text}
                                                    </Text>
                                                    <Badge colorScheme="green">
                                                        <FaCheck style={{ display: 'inline', marginRight: '4px' }} />
                                                        Answered
                                                    </Badge>
                                                </HStack>
                                                <Box pl={4} py={2} borderLeft="4px solid" borderColor="green.400">
                                                    <Text fontSize="md" color="green.700" fontWeight="semibold">
                                                        Your answer: {selectedChoice?.choice_text || 'Unknown'}
                                                    </Text>
                                                </Box>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </VStack>
                    </Box>
                )}

                {/* Display unanswered questions */}
                {unansweredQuestions.length > 0 && (
                    <>
                        <Divider />
                        <Box>
                            <Heading as="h3" size="lg" mb={4} color="orange.600">
                                Questions You Haven't Answered
                            </Heading>
                            <Alert status="info" mb={4}>
                                <AlertIcon />
                                <AlertDescription>
                                    You can answer these questions by clicking "Change Answers" below.
                                </AlertDescription>
                            </Alert>
                            <VStack spacing={3} align="stretch">
                                {unansweredQuestions.map((question) => (
                                    <Card key={question.id} variant="outline" borderColor="orange.200">
                                        <CardBody>
                                            <Text fontSize="md" color="gray.700">
                                                {question.question_text}
                                            </Text>
                                        </CardBody>
                                    </Card>
                                ))}
                            </VStack>
                        </Box>
                    </>
                )}

                <Divider />

                {/* Action buttons */}
                <HStack justify="center" spacing={4} flexWrap="wrap">
                    <Button
                        leftIcon={<FaEdit />}
                        colorScheme="orange"
                        size="lg"
                        onClick={handleChangeAnswers}
                    >
                        Change Answers
                    </Button>
                    <Button
                        leftIcon={<FaChartBar />}
                        colorScheme="blue"
                        size="lg"
                        onClick={handleViewResults}
                    >
                        View Results
                    </Button>
                    <Button
                        variant="outline"
                        colorScheme="gray"
                        size="lg"
                        onClick={handleReturnHome}
                    >
                        Return Home
                    </Button>
                </HStack>
                
                {/* Danger zone - Delete all votes */}
                {answeredQuestions.length > 0 && (
                    <>
                        <Divider />
                        <Box textAlign="center" p={4} borderWidth={1} borderColor="red.200" borderRadius="md" bg="red.50">
                            <VStack spacing={3}>
                                <Text fontSize="sm" fontWeight="bold" color="red.700">
                                    Danger Zone
                                </Text>
                                <Text fontSize="sm" color="gray.700">
                                    Remove all your submitted votes permanently
                                </Text>
                                <Button
                                    leftIcon={<FaTrash />}
                                    colorScheme="red"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteAllVotes}
                                    isLoading={deletingVotes}
                                >
                                    Delete All My Votes
                                </Button>
                            </VStack>
                        </Box>
                    </>
                )}
            </VStack>
            
            {/* Warning Modal for Deleting All Votes */}
            <Modal isOpen={isWarningOpen} onClose={onWarningClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete All Your Votes?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontWeight="bold" color="red.600">
                                ⚠️ Warning: This action cannot be undone!
                            </Text>
                            <Text>
                                You are about to permanently delete all your submitted votes. 
                                Once deleted, your votes cannot be retrieved.
                            </Text>
                            <Text fontWeight="semibold">
                                Are you sure you want to continue?
                            </Text>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onWarningClose}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="red" 
                            onClick={handleConfirmDelete}
                            isLoading={deletingVotes}
                        >
                            Yes, Delete All My Votes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default UserVotesReviewPage;

