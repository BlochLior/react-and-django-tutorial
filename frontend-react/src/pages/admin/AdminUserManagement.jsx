import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
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
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaUserShield } from 'react-icons/fa';
import { pollsApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import usePageTitle from '../../hooks/usePageTitle';

const AdminUserManagement = () => {
  usePageTitle('Admin User Management - Polling App');
  
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToRemove, setUserToRemove] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const users = await pollsApi.getAdminUsers();
      setAdminUsers(users);
      setError(null);
    } catch (err) {
      setError('Failed to fetch admin users');
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await pollsApi.addAdminUser(newEmail.trim());
      toast({
        title: 'Success',
        description: 'Admin user added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewEmail('');
      fetchAdminUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to add admin user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = (user) => {
    setUserToRemove(user);
    onOpen();
  };

  const confirmRemoveAdmin = async () => {
    try {
      setIsSubmitting(true);
      await pollsApi.removeAdminUser(userToRemove.google_email);
      toast({
        title: 'Success',
        description: 'Admin user removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAdminUsers();
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to remove admin user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading admin users..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <Box py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" color="teal.600" mb={2}>
            <FaUserShield style={{ display: 'inline', marginRight: '8px' }} />
            Admin User Management
          </Heading>
          <Text color="gray.600">
            Manage admin users who can access the admin dashboard and manage polls.
          </Text>
        </Box>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">
            Only the main admin can add or remove other admin users. 
            The main admin cannot be removed or revoke their own privileges.
          </Text>
        </Alert>

        {/* Add Admin User */}
        <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
          <Heading size="md" mb={4} color="teal.600">
            Add New Admin User
          </Heading>
          <HStack spacing={4}>
            <Input
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              flex={1}
            />
            <Button
              leftIcon={<FaPlus />}
              colorScheme="teal"
              onClick={handleAddAdmin}
              isLoading={isSubmitting}
              loadingText="Adding..."
            >
              Add Admin
            </Button>
          </HStack>
        </Box>

        {/* Admin Users List */}
        <Box>
          <Heading size="md" mb={4} color="teal.600">
            Current Admin Users ({adminUsers.length})
          </Heading>
          
          {adminUsers.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No admin users found</Text>
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Name</Th>
                  <Th>Added Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {adminUsers.map((user, index) => (
                  <Tr key={index}>
                    <Td>
                      <Text fontWeight="medium">{user.google_email}</Text>
                    </Td>
                    <Td>
                      <Text>{user.google_name || 'N/A'}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="green" variant="subtle">
                        Admin
                      </Badge>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveAdmin(user)}
                        aria-label="Remove admin"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Remove Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Remove Admin User</ModalHeader>
            <ModalBody>
              <Text>
                Are you sure you want to remove <strong>{userToRemove?.google_email}</strong> as an admin?
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRemoveAdmin}
                isLoading={isSubmitting}
                loadingText="Removing..."
              >
                Remove Admin
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default AdminUserManagement;
