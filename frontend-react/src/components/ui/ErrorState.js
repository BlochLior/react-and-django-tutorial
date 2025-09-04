import React from 'react';
import { Box, Alert, AlertIcon, AlertDescription, AlertTitle } from '@chakra-ui/react';

/**
 * Reusable error state component with customizable message and styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {string} props.title - Optional title for the error
 * @param {string} props.status - Alert status ('error', 'warning', 'info', 'success')
 * @param {string} props.variant - Alert variant ('subtle', 'solid', 'left-accent', 'top-accent')
 */
const ErrorState = ({ 
  message, 
  title,
  status = 'error',
  variant = 'subtle'
}) => {
  if (!message) return null;
  
  return (
    <Box py={8}>
      <Alert status={status} variant={variant} borderRadius="md">
        <AlertIcon />
        <Box>
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default ErrorState;
