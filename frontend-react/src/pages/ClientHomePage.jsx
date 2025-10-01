import React from 'react';
import { Box, VStack, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { FaSync } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientHomePage = () => {
    const { user, hasVoted, refreshAuthStatus } = useAuth();
    const navigate = useNavigate();

    // Refresh auth status when component mounts (e.g., after returning from success page)
    React.useEffect(() => {
        console.log('ClientHomePage: Component mounted, refreshing auth status');
        refreshAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

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
                    Welcome back, {user?.name || user?.email}!
                </Heading>
                
                <Text fontSize="lg" textAlign="center">
                    You have <strong>client access</strong> and have{' '}
                    {hasVoted ? 'already answered' : 'not yet answered'} the poll.
                </Text>

                {hasVoted ? (
                    <VStack spacing={4}>
                        <HStack spacing={4}>
                            <Button colorScheme="blue" onClick={handleReviewAnswers}>
                                Review Answers
                            </Button>
                            <Button colorScheme="orange" onClick={handleAnswerPoll}>
                                Re-answer Poll
                            </Button>
                        </HStack>
                        <HStack spacing={4}>
                            <Button colorScheme="green" onClick={handleShowResults}>
                                Show Results Summary
                            </Button>
                            <Button 
                                colorScheme="gray" 
                                variant="outline" 
                                leftIcon={<FaSync />}
                                onClick={() => {
                                    console.log('ClientHomePage: Manual refresh clicked');
                                    refreshAuthStatus();
                                }}
                            >
                                Refresh Status
                            </Button>
                        </HStack>
                    </VStack>
                ) : (
                    <VStack spacing={4}>
                        <Button colorScheme="teal" size="lg" onClick={handleAnswerPoll}>
                            Answer Poll
                        </Button>
                        <Button 
                            colorScheme="gray" 
                            variant="outline" 
                            leftIcon={<FaSync />}
                            onClick={() => {
                                console.log('ClientHomePage: Manual refresh clicked');
                                refreshAuthStatus();
                            }}
                        >
                            Refresh Status
                        </Button>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
};

export default ClientHomePage;
