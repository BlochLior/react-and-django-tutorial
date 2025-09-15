import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
  const renderComponent = (props = {}) => {
    return render(<LoadingState {...props} />);
  };

  describe('Rendering', () => {
    test('renders with default message and spinner', () => {
      renderComponent();
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      const customMessage = 'Please wait while we fetch your data...';
      renderComponent({ message: customMessage });
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('renders without message when message is empty string', () => {
      renderComponent({ message: "" });
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });

    test('renders without message when message is null', () => {
      renderComponent({ message: null });
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });

    test('renders with default message when message is undefined', () => {
      renderComponent({ message: undefined });
      
      // When message is undefined, it defaults to 'Loading...'
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });
  });

  describe('Spinner Customization', () => {
    test('renders with custom spinner size', () => {
      renderComponent({ spinnerSize: "sm" });
      
      const spinner = screen.getByTestId('chakra-spinner');
      expect(spinner).toHaveAttribute('data-size', 'sm');
    });

    test('renders with custom spinner color', () => {
      renderComponent({ spinnerColor: "blue.500" });
      
      const spinner = screen.getByTestId('chakra-spinner');
      expect(spinner).toHaveAttribute('data-color', 'blue.500');
    });

    test('renders with custom spinner thickness', () => {
      renderComponent({ spinnerThickness: "8px" });
      
      const spinner = screen.getByTestId('chakra-spinner');
      expect(spinner).toHaveAttribute('data-thickness', '8px');
    });

    test('renders with all custom props', () => {
      const customMessage = 'Custom loading message';
      renderComponent({
        message: customMessage,
        spinnerSize: "lg",
        spinnerColor: "red.500",
        spinnerThickness: "6px"
      });
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
      
      const spinner = screen.getByTestId('chakra-spinner');
      expect(spinner).toHaveAttribute('data-size', 'lg');
      expect(spinner).toHaveAttribute('data-color', 'red.500');
      expect(spinner).toHaveAttribute('data-thickness', '6px');
    });
  });

  describe('Component Structure', () => {
    test('maintains proper layout structure', () => {
      renderComponent({ message: "Test message" });
      
      // Should have the center container
      const centerContainer = screen.getByTestId('chakra-center');
      expect(centerContainer).toBeInTheDocument();
      
      // Should have the vertical stack
      const vStack = screen.getByTestId('chakra-vstack');
      expect(vStack).toBeInTheDocument();
      
      // Should have both spinner and text
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});
