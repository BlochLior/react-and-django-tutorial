import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    HStack,
    Card,
    CardBody,
    Icon,
    Badge,
    Divider,
    Center,
    useColorModeValue
} from '@chakra-ui/react';
import { FaCheckCircle, FaChartBar, FaHome } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';
import { useAuth } from '../../contexts/AuthContext';

function SuccessPage() {
    usePageTitle('Success! - Polling App');
    const navigate = useNavigate();
    const { refreshAuthStatus } = useAuth();
    const [countdown, setCountdown] = useState(10); // Reduced from 15s to 10s for faster redirect

    // Colors for the celebration theme
    const bgGradient = useColorModeValue(
        'linear(to-br, green.50, teal.50, blue.50)',
        'linear(to-br, green.900, teal.900, blue.900)'
    );
    
    const cardBg = useColorModeValue('white', 'gray.800');

    // Refresh auth status when component mounts to update hasVoted status
    useEffect(() => {
        refreshAuthStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Auto-redirect countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <Box 
            minH="80vh" 
            bgGradient={bgGradient}
            py={12}
            px={4}
        >
            <Center>
                <Box maxW="2xl" w="full">
                    <VStack spacing={8} align="center">
                        {/* Success Icon and Main Message */}
                        <VStack spacing={6}>
                            <Icon 
                                as={FaCheckCircle} 
                                boxSize={20} 
                                color="green.500"
                                filter="drop-shadow(0 4px 12px rgba(72, 187, 120, 0.3))"
                            />
                            <VStack spacing={3} textAlign="center">
                                <Heading 
                                    as="h1" 
                                    size="2xl" 
                                    color="green.600"
                                    textShadow="0 2px 4px rgba(0,0,0,0.1)"
                                >
                                    🎉 Success!
                                </Heading>
                                <Text fontSize="xl" color="gray.600" maxW="md">
                                    Your votes have been successfully submitted and recorded.
                                </Text>
                            </VStack>
                        </VStack>

                        {/* Info Card */}
                        <Card bg={cardBg} shadow="xl" borderRadius="xl" w="full">
                            <CardBody>
                                <VStack spacing={6}>
                                    <VStack spacing={3} textAlign="center">
                                        <Badge colorScheme="green" p={3} borderRadius="full" fontSize="sm">
                                            <FaCheckCircle style={{ marginRight: '8px' }} />
                                            Vote Submission Complete
                                        </Badge>
                                        <Text color="gray.600" fontSize="md">
                                            Thank you for participating in our polling system. Your responses
                                            have been anonymously recorded and will contribute to the final results.
                                        </Text>
                                    </VStack>

                                    <Divider />

                                    <VStack spacing={2}>
                                        <Text fontSize="sm" color="gray.500" textAlign="center">
                                            You will be automatically redirected to the home page in:
                                        </Text>
                                        <Badge 
                                            colorScheme="blue" 
                                            fontSize="lg" 
                                            p={2} 
                                            borderRadius="md"
                                            minW="60px"
                                            textAlign="center"
                                        >
                                            {countdown}s
                                        </Badge>
                                    </VStack>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Navigation Options */}
                        <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
                            <CardBody>
                                <VStack spacing={4}>
                                    <Text fontSize="md" fontWeight="medium" color="gray.700" textAlign="center">
                                        What would you like to do next?
                                    </Text>
                                    
                                    <HStack spacing={4} w="full" justify="center" flexWrap="wrap">
                                        <Button
                                            leftIcon={<FaHome />}
                                            colorScheme="blue"
                                            size="lg"
                                            onClick={() => handleNavigate('/')}
                                            flex={{ base: "1", md: "none" }}
                                            minW="200px"
                                        >
                                            Return Home
                                        </Button>
                                        <Button
                                            leftIcon={<FaChartBar />}
                                            colorScheme="green"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => handleNavigate('/results')}
                                            flex={{ base: "1", md: "none" }}
                                            minW="200px"
                                        >
                                            View Results
                                        </Button>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Footer Message */}
                        <Text fontSize="sm" color="gray.500" textAlign="center" maxW="lg">
                            Your privacy is important to us. All votes are recorded anonymously 
                            and cannot be traced back to individual participants.
                        </Text>
                    </VStack>
                </Box>
            </Center>
        </Box>
    );
}

export default SuccessPage;
