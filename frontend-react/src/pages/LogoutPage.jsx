import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const LogoutPage = () => {
    usePageTitle('Logging Out - Polling App');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await logout();
                // Redirect to home page after successful logout
                navigate('/');
            } catch (error) {
                console.error('Logout error:', error);
                navigate('/');
            }
        };

        handleLogout();
    }, [logout, navigate]);

    return (
        <Box py={8}>
            <VStack spacing={6} align="center">
                <Spinner size="xl" color="blue.500" />
                <Text fontSize="lg">Logging out...</Text>
            </VStack>
        </Box>
    );
};

export default LogoutPage;
