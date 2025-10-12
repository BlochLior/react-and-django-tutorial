import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Button,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@chakra-ui/react';
import QuestionForm from '../../components/admin/QuestionForm.jsx';
import usePageTitle from '../../hooks/usePageTitle';
import { adminApi } from '../../services/apiService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import useQuery from '../../hooks/useQuery';
import useMutation from '../../hooks/useMutation';
import { useQueryClient } from '@tanstack/react-query';

const QuestionDetail = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef();
    const queryClient = useQueryClient();

    // Create stable query function to prevent infinite loops
    const getQuestionQuery = useCallback(async () => {
        return adminApi.getQuestion(questionId);
    }, [questionId]);

    // Using custom query hook for fetching question data
    const { 
        data: fetchedData,
        loading: isFetching,
        error: fetchError
    } = useQuery(
        getQuestionQuery,
        ['question-detail', questionId], // Unique key with question ID
        { 
            errorMessage: 'Failed to fetch question details.',
            refetchOnMount: true // Always fetch fresh data when editing
        }
    );

    // Dynamic title based on question data
    usePageTitle(
        fetchedData?.question_text 
            ? `Edit: ${fetchedData.question_text.substring(0, 50)}${fetchedData.question_text.length > 50 ? '...' : ''} - Polling App`
            : 'Edit Question - Polling App'
    );

    // Using custom mutation hook for updating questions
    const [updateQuestion, { loading: isLoading }] = useMutation(
        (formData) => adminApi.updateQuestion(questionId, formData),
        {
            errorMessage: 'Failed to update question. Please try again.',
            onSuccess: () => {
                toast({
                    title: 'Success!',
                    description: 'Question updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                // Invalidate all queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['query'] });
                navigate('/admin/');
            }
        }
    );

    // Using custom mutation hook for deleting questions
    const [deleteQuestion, { loading: isDeleting }] = useMutation(
        () => adminApi.deleteQuestion(questionId),
        {
            errorMessage: 'Failed to delete question. Please try again.',
            onSuccess: () => {
                toast({
                    title: 'Success!',
                    description: 'Question deleted successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                // Invalidate all queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['query'] });
                navigate('/admin/');
            }
        }
    );

    const handleUpdate = async (formData) => {
        await updateQuestion(formData);
    };

    const handleDelete = async () => {
        await deleteQuestion();
        onClose();
    };

    // Loading state
    if (isFetching) {
        return <LoadingState message="Loading question details..." />;
    }

    // Error state
    if (fetchError) {
        return <ErrorState message={fetchError} />;
    }

    const deleteButton = (
        <Button
            colorScheme="red"
            variant="outline"
            onClick={onOpen}
            isLoading={isDeleting}
        >
            Delete Question
        </Button>
    );

    return (
        <Box py={8}>
            <QuestionForm
                title="Edit Question"
                onSubmit={handleUpdate}
                initialData={fetchedData}
                isLoading={isLoading}
                submitButtonText="Save Changes"
                deleteButton={deleteButton}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Question
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="red" 
                                onClick={handleDelete}
                                isLoading={isDeleting}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default QuestionDetail;