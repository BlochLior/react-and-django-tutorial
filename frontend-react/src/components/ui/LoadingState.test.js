import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
  test('renders with default message and spinner', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    const customMessage = 'Please wait while we fetch your data...';
    render(<LoadingState message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('renders without message when message is empty string', () => {
    render(<LoadingState message="" />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
  });

  test('renders without message when message is null', () => {
    render(<LoadingState message={null} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
  });

  test('renders with default message when message is undefined', () => {
    render(<LoadingState message={undefined} />);
    
    // When message is undefined, it defaults to 'Loading...'
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
  });

  test('renders with custom spinner size', () => {
    render(<LoadingState spinnerSize="sm" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-size', 'sm');
  });

  test('renders with custom spinner color', () => {
    render(<LoadingState spinnerColor="blue.500" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-color', 'blue.500');
  });

  test('renders with custom spinner thickness', () => {
    render(<LoadingState spinnerThickness="8px" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-thickness', '8px');
  });

  test('renders with all custom props', () => {
    const customMessage = 'Custom loading message';
    render(
      <LoadingState 
        message={customMessage}
        spinnerSize="lg"
        spinnerColor="red.500"
        spinnerThickness="6px"
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-size', 'lg');
    expect(spinner).toHaveAttribute('data-color', 'red.500');
    expect(spinner).toHaveAttribute('data-thickness', '6px');
  });

  test('maintains proper layout structure', () => {
    render(<LoadingState message="Test message" />);
    
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
