import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  useToast
} from '@chakra-ui/react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { pollsApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import usePageTitle from '../../hooks/usePageTitle';

const PollClosure = () => {
  usePageTitle('Poll Closure Management - Polling App');
  
  const [pollStatus, setPollStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [action, setAction] = useState(null); // 'close' or 'reopen'
  const toast = useToast();

  useEffect(() => {
    fetchPollStatus();
  }, []);

  const fetchPollStatus = async () => {
    try {
      setLoading(true);
      const status = await pollsApi.getPollStatus();
      setPollStatus(status);
      setError(null);
    } catch (err) {
      setError('Failed to fetch poll status');
      console.error('Error fetching poll status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePoll = () => {
    setAction('close');
    onOpen();
  };

  const handleReopenPoll = () => {
    setAction('reopen');
    onOpen();
  };

  const confirmAction = async () => {
    try {
      setIsSubmitting(true);
      
      if (action === 'close') {
        await pollsApi.closePoll();
        toast({
          title: 'Poll Closed',
          description: 'The poll has been closed successfully. No further votes will be accepted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else if (action === 'reopen') {
        await pollsApi.reopenPoll();
        toast({
          title: 'Poll Reopened',
          description: 'The poll has been reopened. Users can now vote again.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      fetchPollStatus();
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || `Failed to ${action} poll`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading poll status..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <Box py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" color="teal.600" mb={2}>
            {pollStatus?.is_closed ? (
              <FaLock style={{ display: 'inline', marginRight: '8px' }} />
            ) : (
              <FaUnlock style={{ display: 'inline', marginRight: '8px' }} />
            )}
            Poll Closure Management
          </Heading>
          <Text color="gray.600">
            Manage the poll status. When closed, no new votes will be accepted.
          </Text>
        </Box>

        {/* Current Status */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg={pollStatus?.is_closed ? "red.50" : "green.50"}>
          <VStack spacing={4}>
            <HStack spacing={4}>
              <Badge 
                colorScheme={pollStatus?.is_closed ? "red" : "green"} 
                fontSize="lg" 
                px={4} 
                py={2}
              >
                {pollStatus?.is_closed ? "POLL CLOSED" : "POLL OPEN"}
              </Badge>
            </HStack>
            
            {pollStatus?.is_closed && (
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  Closed at: {new Date(pollStatus.closed_at).toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Closed by: {pollStatus.closed_by}
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Action Buttons */}
        <Box>
          {pollStatus?.is_closed ? (
            <VStack spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text>
                  The poll is currently closed. Users cannot submit new votes.
                </Text>
              </Alert>
              
              <Button
                leftIcon={<FaUnlock />}
                colorScheme="green"
                size="lg"
                onClick={handleReopenPoll}
                isLoading={isSubmitting}
                loadingText="Reopening..."
              >
                Reopen Poll
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text>
                  The poll is currently open. Users can submit votes.
                </Text>
              </Alert>
              
              <Button
                leftIcon={<FaLock />}
                colorScheme="red"
                size="lg"
                onClick={handleClosePoll}
                isLoading={isSubmitting}
                loadingText="Closing..."
              >
                Close Poll
              </Button>
            </VStack>
          )}
        </Box>

        {/* Impact Information */}
        <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
          <Heading size="md" mb={4} color="teal.600">
            Impact of Poll Closure
          </Heading>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm">
              <strong>When Poll is Closed:</strong>
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Users cannot submit new votes
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Users cannot modify existing votes
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Results remain visible to all users
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Admin functions remain available
            </Text>
            
            <Text fontSize="sm" mt={4}>
              <strong>When Poll is Reopened:</strong>
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Users can submit new votes again
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • Users can modify existing votes
            </Text>
            <Text fontSize="sm" color="gray.600" ml={4}>
              • All previous functionality is restored
            </Text>
          </VStack>
        </Box>

        {/* Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {action === 'close' ? 'Close Poll' : 'Reopen Poll'}
            </ModalHeader>
            <ModalBody>
              {action === 'close' ? (
                <VStack spacing={4} align="stretch">
                  <Alert status="warning">
                    <AlertIcon />
                    <Text>
                      Are you sure you want to close the poll? This will prevent users from submitting new votes.
                    </Text>
                  </Alert>
                  <Text>
                    <strong>This action will:</strong>
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Block all new vote submissions
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Prevent vote modifications
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Keep results visible
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Text>
                      Are you sure you want to reopen the poll? Users will be able to vote again.
                    </Text>
                  </Alert>
                  <Text>
                    <strong>This action will:</strong>
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Allow new vote submissions
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Allow vote modifications
                  </Text>
                  <Text fontSize="sm" color="gray.600" ml={4}>
                    • Restore full functionality
                  </Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={action === 'close' ? 'red' : 'green'}
                onClick={confirmAction}
                isLoading={isSubmitting}
                loadingText={action === 'close' ? 'Closing...' : 'Reopening...'}
              >
                {action === 'close' ? 'Close Poll' : 'Reopen Poll'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default PollClosure;
