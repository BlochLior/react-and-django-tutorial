import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  Heading
} from '@chakra-ui/react';

function Header() {
  return (
    <Box bg="white" borderBottom={1} borderStyle="solid" borderColor="gray.200">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="7xl" mx="auto" px={4}>
        <Heading as="h1" size="lg" color="teal.500">
          Polling App
        </Heading>
        
        <HStack as="nav" spacing={8}>
          <Link as={RouterLink} to="/polls" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Polls
          </Link>
          <Link as={RouterLink} to="/admin" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Admin
          </Link>
          <Link as={RouterLink} to="/admin/results/" fontSize="md" fontWeight="medium" _hover={{ textDecoration: 'none', color: 'teal.500' }}>
            Results
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;