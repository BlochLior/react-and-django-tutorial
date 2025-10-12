import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  Grid,
  GridItem,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
  Center
} from '@chakra-ui/react';
import { FaVoteYea, FaClock, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';
import { isPublicationDateFuture, formatPublicationDate } from '../../utils/dateUtils';
import { adminApi, pollsApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import useQuery from '../../hooks/useQuery';
import { useAuth } from '../../contexts/AuthContext';
import { 
  hasQuestionChoices, 
  calculateVotePercentage, 
  categorizeQuestions, 
  getQuestionCardColor 
} from '../../utils/questionUtils';

const ResultsSummary = () => {
  usePageTitle('Results Summary - Polling App');
  const { isAdmin } = useAuth();
  const [pollStatus, setPollStatus] = useState(null);
  
  // Create a stable query function
  const getResultsSummaryQuery = useCallback(async () => {
    return adminApi.getResultsSummary();
  }, []);
  
  // Using custom query hook for data fetching
  const { 
    data: summary,
    loading,
    error
  } = useQuery(
    getResultsSummaryQuery,
    ['results-summary'],  // Unique identifier for this query to prevent cache collision
    { 
      errorMessage: 'Failed to fetch poll results.',
      refetchOnMount: true  // Always fetch fresh data when component mounts
    }
  );

  // Fetch poll status
  useEffect(() => {
    const fetchPollStatus = async () => {
      try {
        const response = await pollsApi.getPollStatus();
        setPollStatus(response);
      } catch (error) {
        console.error('Failed to fetch poll status:', error);
      }
    };

    fetchPollStatus();
  }, []);

  if (loading) {
    return <LoadingState message="Loading results..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!summary || !summary.questions_results || summary.questions_results.length === 0) {
    return (
      <Box py={8}>
        <Center>
          <VStack spacing={4}>
            <Icon as={FaQuestionCircle} boxSize={12} color="gray.400" />
            <Text fontSize="lg" color="gray.500">
              No results to display.
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Organize questions by type using shared utility
  const {
    publishedWithVotes,
    futureWithChoices,
    publishedChoiceless,
    futureChoiceless
  } = categorizeQuestions(summary.questions_results);

  // Component to render individual question results
  const QuestionResultsCard = ({ question, type }) => {
    const questionHasChoices = hasQuestionChoices(question);
    
    const cardColor = getQuestionCardColor(type, questionHasChoices);

  return (
      <Card variant="outline" borderColor={`${cardColor}.200`}>
        <CardHeader pb={3}>
          <HStack justify="space-between" align="flex-start">
            <Heading as="h3" size="md" color="gray.700" flex="1">
              {question.question_text}
            </Heading>
            <VStack align="flex-end" spacing={1}>
              {isPublicationDateFuture(question.pub_date) && (
                <Badge colorScheme="yellow" size="sm">
                  <FaClock style={{ marginRight: '4px' }} />
                  To be published
                </Badge>
              )}
              {!questionHasChoices && (
                <Badge colorScheme="red" size="sm">
                  <FaExclamationTriangle style={{ marginRight: '4px' }} />
                  No choices
                </Badge>
              )}
            </VStack>
          </HStack>
          {question.pub_date && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              {isPublicationDateFuture(question.pub_date) ? 'To be published:' : 'Published:'} {formatPublicationDate(question.pub_date)}
            </Text>
          )}
        </CardHeader>
        
        <CardBody pt={0}>
          {questionHasChoices ? (
            <VStack spacing={4} align="stretch">
              <HStack>
                <Badge colorScheme="blue" size="sm">
                  <FaVoteYea style={{ marginRight: '4px' }} />
                  {question.total_votes} total votes
                </Badge>
              </HStack>
              
              {question.choices.map((choice, index) => {
                const percentage = calculateVotePercentage(choice.votes, question.total_votes);

                return (
                  <Box key={choice.id || index}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {choice.choice_text}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          {choice.votes} votes
                        </Text>
                        <Text fontSize="sm" fontWeight="medium" color="teal.600">
                          {percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                    </HStack>
                    <Progress
                      value={percentage}
                      colorScheme="teal"
                      size="md"
                      borderRadius="md"
                    />
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Alert status="warning" variant="subtle">
              <AlertIcon />
              <AlertDescription>
                This question has no choices available for voting.
              </AlertDescription>
            </Alert>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Box py={8} maxW="6xl" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Heading as="h1" size="2xl" textAlign="center" color="teal.600">
          Poll Results Summary
        </Heading>

        {/* Poll Status */}
        {pollStatus && (
          <Box bg="white" p={6} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow="sm">
            <VStack spacing={3}>
              <Heading size="sm" color="gray.700" textAlign="center">
                {pollStatus.is_closed ? "🔒 Poll Status" : "🟢 Poll Status"}
              </Heading>
              <Badge 
                colorScheme={pollStatus.is_closed ? "red" : "green"} 
                fontSize="lg" 
                px={6} 
                py={3} 
                borderRadius="md"
              >
                {pollStatus.is_closed ? "🔒 Closed" : "🟢 Open"}
              </Badge>
              {pollStatus.is_closed && pollStatus.closed_at && (
                <Text fontSize="sm" textAlign="center" color="gray.600">
                  Closed since: <strong>{new Date(pollStatus.closed_at).toLocaleString()}</strong>
                </Text>
              )}
              {isAdmin && pollStatus.is_closed && pollStatus.closed_by && (
                <Text fontSize="sm" textAlign="center" color="gray.600">
                  Closed by: <strong>{pollStatus.closed_by}</strong>
                </Text>
              )}
            </VStack>
          </Box>
        )}

        {/* Overall Stats */}
        <Box bg="white" p={6} borderRadius="lg" borderWidth={1} borderColor="gray.200" shadow="sm">
          <StatGroup>
            <Stat textAlign="center">
              <StatLabel fontSize="md" color="gray.600">Total Questions</StatLabel>
              <StatNumber fontSize="3xl" color="teal.500">{summary.total_questions}</StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel fontSize="md" color="gray.600">Total Votes</StatLabel>
              <StatNumber fontSize="3xl" color="blue.500">{summary.total_votes_all_questions}</StatNumber>
            </Stat>
          </StatGroup>
        </Box>

        {/* Published Questions with Votes */}
        {publishedWithVotes.length > 0 && (
          <Box>
            <HStack mb={6} align="center">
              <Icon as={FaVoteYea} color="green.500" boxSize={6} />
              <Heading as="h2" size="lg" color="green.600">
                Published Questions with Votes ({publishedWithVotes.length})
              </Heading>
            </HStack>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
              {publishedWithVotes.map(question => (
                <GridItem key={question.id}>
                  <QuestionResultsCard question={question} type="published" />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {/* Future Questions with Choices */}
        {futureWithChoices.length > 0 && (
          <Box>
            <Divider />
            <HStack mb={6} align="center">
              <Icon as={FaClock} color="blue.500" boxSize={6} />
              <Heading as="h2" size="lg" color="blue.600">
                Future Questions with Choices ({futureWithChoices.length})
              </Heading>
            </HStack>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
              {futureWithChoices.map(question => (
                <GridItem key={question.id}>
                  <QuestionResultsCard question={question} type="future" />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {/* Published Choiceless Questions */}
        {publishedChoiceless.length > 0 && (
          <Box>
            <Divider />
            <HStack mb={6} align="center">
              <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} />
              <Heading as="h2" size="lg" color="red.600">
                Published Questions without Choices ({publishedChoiceless.length})
              </Heading>
            </HStack>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
              {publishedChoiceless.map(question => (
                <GridItem key={question.id}>
                  <QuestionResultsCard question={question} type="published" />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}

        {/* Future Choiceless Questions */}
        {futureChoiceless.length > 0 && (
          <Box>
            <Divider />
            <HStack mb={6} align="center">
              <Icon as={FaQuestionCircle} color="orange.500" boxSize={6} />
              <Heading as="h2" size="lg" color="orange.600">
                Future Questions without Choices ({futureChoiceless.length})
              </Heading>
            </HStack>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
              {futureChoiceless.map(question => (
                <GridItem key={question.id}>
                  <QuestionResultsCard question={question} type="future" />
                </GridItem>
              ))}
            </Grid>
          </Box>
        )}
      </VStack>
    </Box>
  );
};


export default ResultsSummary;