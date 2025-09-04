import React from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Card,
    CardBody,
    Badge,
    HStack,
    Divider,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react';
import { FaCheck, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';

function ReviewPage({ questions, selectedAnswers, onSubmit }) {
    // Filter questions into answered and unanswered lists
    const answeredQuestions = questions.filter(
        (q) => selectedAnswers[q.id] !== undefined
    );
    const unansweredQuestions = questions.filter(
        (q) => selectedAnswers[q.id] === undefined
    );

    const getChoiceText = (questionId, choiceId) => {
        const question = questions.find((q) => q.id === questionId);
        if (!question) return 'Choice not found';
        const choice = question.choices.find((c) => c.id === choiceId);
        return choice ? choice.choice_text : 'Choice not found';
    };

    return (
        <Box maxW="4xl" mx="auto">
            <VStack spacing={8} align="stretch">
                <Heading as="h2" size="xl" textAlign="center" color="teal.600">
                    Review Your Answers
                </Heading>

                {/* Stats Summary */}
                <HStack justify="center" spacing={6}>
                    <Badge colorScheme="green" p={2} fontSize="sm">
                        <FaCheck style={{ display: 'inline', marginRight: '4px' }} />
                        {answeredQuestions.length} Answered
                    </Badge>
                    <Badge colorScheme="orange" p={2} fontSize="sm">
                        <FaExclamationTriangle style={{ display: 'inline', marginRight: '4px' }} />
                        {unansweredQuestions.length} Remaining
                    </Badge>
                </HStack>

                {/* Display answered questions */}
                <Box>
                    <Heading as="h3" size="lg" mb={4} color="green.600">
                        Answered Questions
                    </Heading>
                    {answeredQuestions.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {answeredQuestions.map((question) => (
                                <Card key={question.id} variant="outline" borderColor="green.200">
                                    <CardBody>
                                        <VStack align="stretch" spacing={2}>
                                            <Text fontWeight="medium" color="gray.700">
                                                {question.question_text}
                                            </Text>
                                            <HStack>
                                                <Badge colorScheme="green" size="sm">
                                                    Your answer:
                                                </Badge>
                                                <Text fontSize="sm" color="green.600" fontWeight="medium">
                                                    {getChoiceText(question.id, selectedAnswers[question.id])}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    ) : (
                        <Text color="gray.500" textAlign="center" py={8}>
                            You haven't answered any questions yet.
                        </Text>
                    )}
                </Box>

                <Divider />

                {/* Display a list of unanswered questions */}
                <Box>
                    <Heading as="h3" size="lg" mb={4} color="orange.600">
                        Unanswered Questions
                    </Heading>
                    {unansweredQuestions.length > 0 ? (
                        <List spacing={3}>
                            {unansweredQuestions.map((question) => (
                                <ListItem key={question.id}>
                                    <ListIcon as={FaExclamationTriangle} color="orange.400" />
                                    <Text as="span" color="gray.700">
                                        {question.question_text}
                                    </Text>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Text color="green.500" textAlign="center" py={8} fontWeight="medium">
                            🎉 All questions have been answered!
                        </Text>
                    )}
                </Box>

                <Divider />

                <Box textAlign="center">
                    <Button
                        leftIcon={<FaPaperPlane />}
                        colorScheme="teal"
                        size="lg"
                        onClick={onSubmit}
                        px={12}
                        py={6}
                        fontSize="lg"
                        isDisabled={answeredQuestions.length === 0}
                    >
                        Submit All Votes
                    </Button>
                    {answeredQuestions.length === 0 && (
                        <Text fontSize="sm" color="gray.500" mt={2}>
                            Please answer at least one question before submitting
                        </Text>
                    )}
                </Box>
            </VStack>
        </Box>
    );
}

export default ReviewPage;