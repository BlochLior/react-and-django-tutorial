import React from 'react';
import { 
  SimpleGrid, 
  Text, 
  Box, 
  VStack,
  Icon 
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import AdminQuestionCard from './AdminQuestionCard';

function AdminQuestionList({ questions }) {
  if (!questions || questions.length === 0) {
    return (
      <Box textAlign="center" py={20}>
        <VStack spacing={4}>
          <Icon as={FaInfoCircle} boxSize={8} color="gray.500" />
          <Text fontSize="xl" fontWeight="medium" color="gray.500">
            No questions available
          </Text>
          <Text fontSize="md" color="gray.500">
            Create your first question to get started!
          </Text>
        </VStack>
      </Box>
    );
  }
  
  return (
    <SimpleGrid 
      columns={{ base: 1, md: 2, lg: 3 }} 
      spacing={6}
      w="full"
      data-testid="admin-question-list"
    >
      {questions.map(question => (
        <AdminQuestionCard
          key={question.id}
          question={question}
        />
      ))}
    </SimpleGrid>
  );
}

export default AdminQuestionList;