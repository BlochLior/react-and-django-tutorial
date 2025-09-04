import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Button,
  HStack,
  Badge
} from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import { isPublicationDateFuture, getPublicationDateText } from '../../utils/dateUtils';

function AdminQuestionCard({ question }) {

  // Using shared date utility functions
  
  // Determine colors and text based on question status
  const choicesCount = question.choices?.length || 0;
  const isChoiceless = choicesCount === 0;
  const isFutureDate = isPublicationDateFuture(question.pub_date);

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
        <Heading as="h3" size="md" color="teal.600" mb={3}>
          {question.question_text}
        </Heading>
        
        <HStack spacing={2} mb={3}>
          <Text 
            fontSize="sm" 
            color={isChoiceless ? "red.500" : "gray.600"}
            fontWeight={isChoiceless ? "medium" : "normal"}
          >
            Choices: {choicesCount}
          </Text>
          <Badge colorScheme="blue" size="sm">
            ID: {question.id}
          </Badge>
        </HStack>

        {question.pub_date && (
          <Text 
            fontSize="sm" 
            color={isFutureDate ? "yellow.600" : "gray.600"}
            fontWeight={isFutureDate ? "medium" : "normal"}
          >
            {getPublicationDateText(question.pub_date)}
          </Text>
        )}
      </CardBody>

      <CardFooter pt={0}>
        <Button 
          as={RouterLink}
          to={`/admin/questions/${question.id}`}
          leftIcon={<FaEdit />}
          colorScheme="teal"
          variant="outline"
          size="sm"
        >
          Edit Question
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminQuestionCard;
