import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  Heading,
  Button,
  Text
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Box bg="white" borderBottom={1} borderStyle="solid" borderColor="gray.200">
        <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto" px={4}>
          <Heading as="h1" size="lg" color="teal.500">
            Polling App
          </Heading>
          
          <HStack as="nav" spacing={8}>
            <Link as={RouterLink} to="/" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
              Home
            </Link>
            <Link as={RouterLink} to="/results" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
              Results
            </Link>
            <Button colorScheme="blue" onClick={() => navigate('/')}>
              Login
            </Button>
          </HStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="white" borderBottom={1} borderStyle="solid" borderColor="gray.200">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto" px={4}>
        <Heading as="h1" size="lg" color="teal.500">
          Polling App
        </Heading>
        
        <HStack as="nav" spacing={8}>
          <Link as={RouterLink} to="/" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Home
          </Link>
          <Link as={RouterLink} to="/polls" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Polls
          </Link>
          {!isAdmin && (
            <Link as={RouterLink} to="/results" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
              Results
            </Link>
          )}
          {isAdmin && (
            <Link as={RouterLink} to="/admin/" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
              Admin Dashboard
            </Link>
          )}
          <Text fontSize="sm" color="gray.600">
            {user?.name || user?.email}
          </Text>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;