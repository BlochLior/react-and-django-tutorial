import React from 'react';
import { VStack, Text, Box } from '@chakra-ui/react';
import QuestionCard from './QuestionCard';

function QuestionList({ questions, selectedAnswers, onAnswerChange }) {
  if (!questions || questions.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          No polls available at the moment.
        </Text>
        <Text fontSize="md" color="gray.500" mt={2}>
          Check back later for new polls!
        </Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={6} align="stretch" data-testid="question-list">
      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          selectedAnswer={selectedAnswers[question.id]}
          onAnswerChange={onAnswerChange}
        />
      ))}
    </VStack>
  );
}

export default QuestionList;