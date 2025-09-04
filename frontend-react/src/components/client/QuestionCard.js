import React from 'react';
import {
  Card,
  CardBody,
  Heading,
  VStack,
  Radio,
  RadioGroup,
  Text
} from '@chakra-ui/react';

function QuestionCard({ question, selectedAnswer, onAnswerChange }) {
  const handleChange = (choiceId) => {
    // Call the onAnswerChange function with the questionId and the new choiceId
    onAnswerChange(question.id, parseInt(choiceId));
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
          
          <RadioGroup 
            value={selectedAnswer ? String(selectedAnswer) : ''} 
            onChange={handleChange}
          >
            <VStack spacing={3} align="stretch">
              {question.choices.map(choice => (
                <Radio 
                  key={choice.id} 
                  value={String(choice.id)}
                  colorScheme="teal"
                  size="lg"
                >
                  <Text fontSize="md" ml={2}>
                    {choice.choice_text}
                  </Text>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default QuestionCard;