import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, HStack, Stat, StatLabel, StatNumber, StatGroup } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../services/apiService';

const AdminHomePage = () => {
    const { user, hasVoted } = useAuth();
    const navigate = useNavigate();
    const [adminStats, setAdminStats] = useState(null);

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

                {hasVoted ? (
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={() => navigate('/polls/review')}>
                            Review Answers
                        </Button>
                        <Button colorScheme="orange" onClick={() => navigate('/polls')}>
                            Re-answer Poll
                        </Button>
                        <Button colorScheme="green" onClick={() => navigate('/admin/results/')}>
                            Comprehensive Summary
                        </Button>
                    </HStack>
                ) : (
                    <Button colorScheme="teal" onClick={() => navigate('/polls')}>
                        Answer Poll
                    </Button>
                )}

                <HStack spacing={4} mt={4}>
                    <Button colorScheme="purple" onClick={() => navigate('/admin/')}>
                        Admin Dashboard
                    </Button>
                    <Button colorScheme="cyan" onClick={() => navigate('/admin/new/')}>
                        Add New Question
                    </Button>
                </HStack>

                {adminStats && (
                    <Box mt={8} p={6} borderWidth={1} borderRadius="lg" bg="gray.50">
                        <Heading size="md" mb={4} textAlign="center">
                            Executive Summary
                        </Heading>
                        <StatGroup>
                            <Stat>
                                <StatLabel>Total Voters</StatLabel>
                                <StatNumber>{adminStats.total_voters}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Total Votes</StatLabel>
                                <StatNumber>{adminStats.total_votes}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Available Questions</StatLabel>
                                <StatNumber>{adminStats.total_questions}</StatNumber>
                            </Stat>
                        </StatGroup>
                        <Text mt={4} fontSize="sm" textAlign="center">
                            Hidden from clients: {adminStats.hidden_questions.total} questions 
                            ({adminStats.hidden_questions.unpublished} unpublished, 
                            {adminStats.hidden_questions.choiceless} choiceless, 
                            {adminStats.hidden_questions.unpublished_choiceless} unpublished choiceless)
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default AdminHomePage;
