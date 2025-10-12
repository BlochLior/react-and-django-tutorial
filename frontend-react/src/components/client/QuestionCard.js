import React from 'react';
import {
  Card,
  CardBody,
  Heading,
  VStack,
  Radio,
  Text
} from '@chakra-ui/react';

function QuestionCard({ question, selectedAnswer, onAnswerChange }) {
  const handleRadioClick = (choiceId) => {
    // Always call onAnswerChange - the parent handles the toggle logic
    // If it's the same choice, parent will remove it; otherwise, parent will set it
    onAnswerChange(question.id, choiceId);
  };

  return (
    <Card 
      bg="white" 
      borderWidth={1}
      borderColor="gray.200"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading as="h3" size="md" color="teal.600">
            {question.question_text}
          </Heading>
          
          <VStack spacing={3} align="stretch">
            {question.choices.map(choice => (
              <Radio 
                key={choice.id} 
                colorScheme="teal"
                size="lg"
                isChecked={selectedAnswer === choice.id}
                onClick={() => handleRadioClick(choice.id)}
                cursor="pointer"
              >
                <Text fontSize="md" ml={2}>
                  {choice.choice_text}
                </Text>
              </Radio>
            ))}
          </VStack>
          
          {selectedAnswer && (
            <Text fontSize="sm" color="gray.600" fontStyle="italic">
              💡 Tip: Click your selected answer again to deselect it
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default QuestionCard;