import React from 'react';
import { Box, VStack, Heading, Button, Text } from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const GuestHomePage = () => {
    const { login, checkAuthStatus } = useAuth();

    return (
        <Box py={8}>
            <VStack spacing={8} align="center">
                <Heading as="h1" size="2xl" textAlign="center">
                    Welcome to Our Polling App
                </Heading>
                <Text fontSize="lg" textAlign="center" maxW="md">
                    Join thousands of users who have already shared their opinions. 
                    Log in with Google to participate in our polls and see results.
                </Text>
                <VStack spacing={4}>
                    <Button
                        leftIcon={<FaGoogle />}
                        colorScheme="blue"
                        size="lg"
                        onClick={login}
                    >
                        Login with Google
                    </Button>
                    <Button
                        colorScheme="gray"
                        size="sm"
                        onClick={checkAuthStatus}
                    >
                        Check Auth Status (Debug)
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default GuestHomePage;
