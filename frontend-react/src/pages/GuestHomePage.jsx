import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Button, Text, Badge, Spinner } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { pollsApi } from '../services/apiService';

const GuestHomePage = () => {
    usePageTitle('Welcome - Polling App');
    const { login } = useAuth();
    const [pollStatus, setPollStatus] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <Box py={8}>
            <VStack spacing={8} align="center">
                <Heading as="h1" size="2xl" textAlign="center">
                    Welcome to Our Polling App
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
                
                <Text fontSize="lg" textAlign="center" maxW="md"> 
                    Log in with Google to participate in our polls.
                </Text>
                
                <Button
                    leftIcon={<FaGoogle />}
                    colorScheme="blue"
                    size="lg"
                    onClick={login}
                >
                    Login with Google
                </Button>
            </VStack>
        </Box>
    );
};

export default GuestHomePage;
