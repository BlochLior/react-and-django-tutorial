import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Badge, Spinner } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { pollsApi } from '../services/apiService';

const ClientHomePage = () => {
    usePageTitle('Home - Polling App');
    const { user, hasVoted, refreshAuthStatus } = useAuth();
    const navigate = useNavigate();
    const [pollStatus, setPollStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Refresh auth status when component mounts (e.g., after returning from success page)
    useEffect(() => {
        console.log('ClientHomePage: Component mounted, refreshing auth status');
        refreshAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Fetch poll status
    useEffect(() => {
        const fetchPollStatus = async () => {
            try {
                const response = await pollsApi.getPollStatus();
                // The response IS the data object directly, not wrapped in response.data
                setPollStatus(response);
            } catch (error) {
                console.error('Failed to fetch poll status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPollStatus();
    }, []);

    const handleAnswerPoll = () => {
        navigate('/polls');
    };

    const handleReviewAnswers = () => {
        navigate('/polls/review');
    };

    const handleShowResults = () => {
        navigate('/results');
    };

    return (
        <Box py={8}>
            <VStack spacing={6} align="center">
                <Heading as="h1" size="xl" textAlign="center">
                    {hasVoted 
                        ? `Welcome back, ${user?.name || user?.email}!` 
                        : `Hello, ${user?.name || user?.email}!`
                    }
                </Heading>
                
                {loading ? (
                    <Spinner size="sm" color="gray.500" />
                ) : pollStatus && (
                    <Badge 
                        colorScheme={pollStatus.is_closed ? "red" : "green"} 
                        fontSize="md" 
                        px={4} 
                        py={2} 
                        borderRadius="md"
                    >
                        Poll Status: {pollStatus.is_closed ? "🔒 Closed" : "🟢 Open"}
                    </Badge>
                )}
                
                <Text fontSize="md" textAlign="center" color="gray.600">
                    {hasVoted 
                        ? "Thank you for participating! You can review or change your answers anytime." 
                        : "Ready to share your opinions? Start by answering the poll below."
                    }
                </Text>
                
                {hasVoted ? (
                    <VStack spacing={4}>
                        <Button colorScheme="blue" size="lg" onClick={handleReviewAnswers}>
                            Review/Change Answers
                        </Button>
                        <Button colorScheme="green" size="lg" onClick={handleShowResults}>
                            View Results
                        </Button>
                    </VStack>
                ) : (
                    <Button colorScheme="teal" size="lg" onClick={handleAnswerPoll}>
                        Answer Poll
                    </Button>
                )}
            </VStack>
        </Box>
    );
};

export default ClientHomePage;
