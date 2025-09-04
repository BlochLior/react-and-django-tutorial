import React from 'react';
import { Center, VStack, Spinner, Text } from '@chakra-ui/react';

/**
 * Reusable loading state component with customizable message and styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {string} props.spinnerSize - Size of the spinner (xs, sm, md, lg, xl)
 * @param {string} props.spinnerColor - Color of the spinner
 * @param {string} props.spinnerThickness - Thickness of the spinner
 */
const LoadingState = ({ 
  message = 'Loading...',
  spinnerSize = 'xl',
  spinnerColor = 'teal.500',
  spinnerThickness = '4px'
}) => {
  return (
    <Center py={20}>
      <VStack spacing={4}>
        <Spinner 
          size={spinnerSize} 
          color={spinnerColor} 
          thickness={spinnerThickness}
        />
        {message && (
          <Text fontSize="lg">{message}</Text>
        )}
      </VStack>
    </Center>
  );
};

export default LoadingState;
