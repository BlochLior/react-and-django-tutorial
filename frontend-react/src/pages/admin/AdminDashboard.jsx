import React, { useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import AdminQuestionList from '../../components/admin/AdminQuestionList';
import Pagination from '../../components/ui/Pagination';
import usePageTitle from '../../hooks/usePageTitle';
import { adminApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import useQuery from '../../hooks/useQuery';
import { categorizeQuestions } from '../../utils/questionUtils';

const AdminDashboard = () => {
    usePageTitle('Admin Dashboard - Polling App');
    
    
    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);

    // Create a stable query function
    const getQuestionsQuery = useCallback(async () => {
        const result = await adminApi.getQuestions(currentPage);
        return result;
    }, [currentPage]); // refreshKey is handled by useQuery dependencies

    // Memoize the onSuccess callback to prevent infinite re-renders
    const onSuccessCallback = useCallback((data) => {
        const { count } = data;
        setTotalQuestions(count);
        setTotalPages(Math.ceil(count / 10)); // Assuming default page size of 10
    }, []);

    // Using custom query hook for data fetching
    const {
        data: response,
        loading,
        error
    } = useQuery(
        getQuestionsQuery,
        [currentPage], // Dependencies for the query
        {
            errorMessage: 'Failed to fetch questions.',
            onSuccess: onSuccessCallback,
            refetchOnMount: true // Force refetch when component mounts
        }
    );

    const questions = response?.results || [];
    
    // Categorize questions
    const {
        publishedWithVotes,
        futureWithChoices,
        publishedChoiceless,
        futureChoiceless
    } = categorizeQuestions(questions);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading) {
        return <LoadingState message="Loading questions..." />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }
    
    // Calculate hasNext and hasPrevious based on current and total pages
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    return (
        <Box py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header Section */}
                <VStack spacing={6} align="stretch">
                    <Heading as="h1" size="xl" color="teal.600" textAlign="center">
                        Admin Dashboard
                    </Heading>
                    
                    {/* Stats Section */}
                    <StatGroup justifyContent="center">
                        <Stat textAlign="center">
                            <StatLabel fontSize="md" color="gray.600">Total Questions</StatLabel>
                            <StatNumber fontSize="2xl" color="teal.500">{totalQuestions}</StatNumber>
                        </Stat>
                    </StatGroup>
                    
                    {/* Add Question Button and Refresh Button */}
                    <HStack justify="center" spacing={4}>
                        <Button
                            as={RouterLink}
                            to="/admin/new"
                            leftIcon={<FaPlus />}
                            colorScheme="teal"
                            size="lg"
                            px={8}
                        >
                            Add New Question
                        </Button>
                    </HStack>
                </VStack>

                {/* Categorized Questions Sections */}
                <VStack spacing={8} align="stretch">
                    {/* Published Questions with Choices */}
                    {publishedWithVotes.length > 0 && (
                        <Box>
                            <Heading as="h2" size="lg" color="green.600" mb={4}>
                                Published Questions ({publishedWithVotes.length})
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Questions that are live and have choices for users to vote on
                            </Text>
                            <AdminQuestionList questions={publishedWithVotes} />
                        </Box>
                    )}

                    {/* Future Questions with Choices */}
                    {futureWithChoices.length > 0 && (
                        <Box>
                            <Divider />
                            <Heading as="h2" size="lg" color="blue.600" mb={4} mt={6}>
                                Future Questions ({futureWithChoices.length})
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Questions scheduled for future publication with choices
                            </Text>
                            <AdminQuestionList questions={futureWithChoices} />
                        </Box>
                    )}

                    {/* Published Questions without Choices */}
                    {publishedChoiceless.length > 0 && (
                        <Box>
                            <Divider />
                            <Heading as="h2" size="lg" color="red.600" mb={4} mt={6}>
                                Published Questions without Choices ({publishedChoiceless.length})
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Questions that are live but have no choices - users cannot vote
                            </Text>
                            <AdminQuestionList questions={publishedChoiceless} />
                        </Box>
                    )}

                    {/* Future Questions without Choices */}
                    {futureChoiceless.length > 0 && (
                        <Box>
                            <Divider />
                            <Heading as="h2" size="lg" color="orange.600" mb={4} mt={6}>
                                Future Questions without Choices ({futureChoiceless.length})
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Questions scheduled for future publication but have no choices
                            </Text>
                            <AdminQuestionList questions={futureChoiceless} />
                        </Box>
                    )}

                    {/* No Questions Message */}
                    {questions.length === 0 && (
                        <Box textAlign="center" py={16}>
                            <VStack spacing={4}>
                                <Text fontSize="lg" color="gray.500">
                                    No questions available yet.
                                </Text>
                                <Text fontSize="md" color="gray.400">
                                    Create your first question to get started!
                                </Text>
                            </VStack>
                        </Box>
                    )}
                </VStack>
                
                {/* Pagination */}
                {questions.length > 0 && (
                    <Box display="flex" justifyContent="center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            hasPrevious={hasPrevious}
                            hasNext={hasNext}
                        />
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default AdminDashboard;