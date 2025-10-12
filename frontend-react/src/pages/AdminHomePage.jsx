import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, HStack, Stat, StatLabel, StatNumber, StatGroup, Badge, Divider, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../services/apiService';
import usePageTitle from '../hooks/usePageTitle';

const AdminHomePage = () => {
    usePageTitle('Admin Home - Polling App');
    const { user, hasVoted } = useAuth();
    const navigate = useNavigate();
    const [adminStats, setAdminStats] = useState(null);
    const [pollStatus, setPollStatus] = useState(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const stats = await pollsApi.getAdminStats();
                setAdminStats(stats);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            }
        };

        if (user?.is_admin) {
            fetchAdminStats();
        }
    }, [user]);

    useEffect(() => {
        const fetchPollStatus = async () => {
            try {
                const response = await pollsApi.getPollStatus();
                console.log('AdminHomePage - Poll status response:', response);
                // The response IS the data object directly, not wrapped in response.data
                setPollStatus(response);
            } catch (error) {
                console.error('AdminHomePage - Failed to fetch poll status:', error);
            }
        };

        fetchPollStatus();
    }, []);

    return (
        <Box py={8}>
            <VStack spacing={6} align="center">
                <Heading as="h1" size="xl" textAlign="center">
                    Welcome back, {user?.name || user?.email}!
                </Heading>
                
                <Text fontSize="lg" textAlign="center">
                    You have <strong>admin access</strong> and have{' '}
                    {hasVoted ? 'already answered' : 'not yet answered'} the poll.
                </Text>

                {pollStatus && (
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

                {hasVoted ? (
                    <VStack spacing={4}>
                        <Button colorScheme="blue" size="lg" onClick={() => navigate('/polls/review')}>
                            Review/Change Answers
                        </Button>
                        <Button colorScheme="green" size="lg" onClick={() => navigate('/admin/results/')}>
                            View Results
                        </Button>
                    </VStack>
                ) : (
                    <Button colorScheme="teal" size="lg" onClick={() => navigate('/polls')}>
                        Answer Poll
                    </Button>
                )}

                <HStack spacing={4} mt={4} flexWrap="wrap" justify="center">
                    <Button colorScheme="purple" onClick={() => navigate('/admin/')}>
                        Admin Dashboard
                    </Button>
                    <Button colorScheme="cyan" onClick={() => navigate('/admin/new/')}>
                        Add New Question
                    </Button>
                    <Button colorScheme="orange" onClick={() => navigate('/admin/users/')}>
                        Manage Admins
                    </Button>
                    <Button colorScheme="red" onClick={() => navigate('/admin/closure/')}>
                        Poll Closure
                    </Button>
                </HStack>

                {adminStats && (
                    <Box mt={8} p={6} borderWidth={1} borderRadius="lg" bg="gray.50" shadow="sm">
                        <Heading size="md" mb={4} textAlign="center" color="teal.600">
                            📊 Executive Summary
                        </Heading>
                        
                        <StatGroup mb={4}>
                            <Stat textAlign="center">
                                <StatLabel color="gray.600" fontSize="sm">Total Voters</StatLabel>
                                <StatNumber color="blue.500" fontSize="2xl">{adminStats.total_voters}</StatNumber>
                            </Stat>
                            <Stat textAlign="center">
                                <StatLabel color="gray.600" fontSize="sm">Total Votes</StatLabel>
                                <StatNumber color="green.500" fontSize="2xl">{adminStats.total_votes}</StatNumber>
                            </Stat>
                            <Stat textAlign="center">
                                <StatLabel color="gray.600" fontSize="sm">Total Questions</StatLabel>
                                <StatNumber color="purple.500" fontSize="2xl">{adminStats.total_questions}</StatNumber>
                            </Stat>
                            <Stat textAlign="center">
                                <StatLabel color="gray.600" fontSize="sm">Visible to Clients</StatLabel>
                                <StatNumber color="teal.500" fontSize="2xl">
                                    {adminStats.total_questions - adminStats.hidden_questions.total}
                                </StatNumber>
                            </Stat>
                        </StatGroup>
                        
                        {pollStatus && (
                            <>
                                <Divider my={4} />
                                <VStack spacing={3} align="stretch">
                                    <Heading size="sm" color="gray.700" textAlign="center">
                                        {pollStatus.is_closed ? "🔒 Poll Status" : "🟢 Poll Status"}
                                    </Heading>
                                    <Badge 
                                        colorScheme={pollStatus.is_closed ? "red" : "green"} 
                                        fontSize="md" 
                                        px={4} 
                                        py={2} 
                                        borderRadius="md"
                                        textAlign="center"
                                        display="block"
                                    >
                                        {pollStatus.is_closed ? "🔒 Closed" : "🟢 Open"}
                                    </Badge>
                                    {pollStatus.is_closed && pollStatus.closed_at && (
                                        <Text fontSize="sm" textAlign="center" color="gray.600">
                                            Closed since: <strong>{new Date(pollStatus.closed_at).toLocaleString()}</strong>
                                        </Text>
                                    )}
                                    {pollStatus.is_closed && pollStatus.closed_by && (
                                        <Text fontSize="sm" textAlign="center" color="gray.600">
                                            Closed by: <strong>{pollStatus.closed_by}</strong>
                                        </Text>
                                    )}
                                </VStack>
                            </>
                        )}
                        
                        <Divider my={4} />
                        
                        <VStack spacing={3} align="stretch">
                            <Heading size="sm" color="gray.700" textAlign="center">
                                🔒 Hidden from Clients
                            </Heading>
                            
                            <HStack justify="center" spacing={4} flexWrap="wrap">
                                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                                    {adminStats.hidden_questions.unpublished} Unpublished
                                </Badge>
                                <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                                    {adminStats.hidden_questions.choiceless} Choiceless
                                </Badge>
                                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                                    {adminStats.hidden_questions.unpublished_choiceless} Unpublished & Choiceless
                                </Badge>
                            </HStack>
                            
                            {adminStats.hidden_questions.total > 0 && (
                                <Alert status="info" borderRadius="md" fontSize="sm" mt={3}>
                                    <AlertIcon />
                                    <Text>
                                        {adminStats.hidden_questions.total} questions are not visible to clients. 
                                        Use Admin Dashboard to manage them.
                                    </Text>
                                </Alert>
                            )}
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default AdminHomePage;
