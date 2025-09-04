import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, useToast } from '@chakra-ui/react';
import QuestionForm from '../../components/admin/QuestionForm';
import usePageTitle from '../../hooks/usePageTitle';
import { adminApi } from '../../services/apiService';
import useMutation from '../../hooks/useMutation';

const NewQuestion = () => {
    usePageTitle('Create New Question - Polling App');
    
    const navigate = useNavigate();
    const toast = useToast();

    // Using custom mutation hook for creating questions
    const [createQuestion, { loading: isLoading }] = useMutation(
        adminApi.createQuestion,
        {
            errorMessage: 'Failed to create question. Please try again.',
            onSuccess: () => {
                toast({
                    title: 'Success!',
                    description: 'Question created successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/admin/');
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to create question. Please try again.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    );

    const handleApiSubmit = async (formData) => {
        await createQuestion(formData);
    };

    return (
        <Box py={8}>
            <QuestionForm
                title="Create New Question"
                onSubmit={handleApiSubmit}
                isLoading={isLoading}
                submitButtonText="Create Question"
            />
        </Box>
    );
};

export default NewQuestion;