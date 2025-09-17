import React from 'react';
import { render, screen } from '@testing-library/react';

// This is a remenant from some debugging of the chakra spinner

// Import our mock directly
const { Spinner } = require('./chakra-mock');

describe('Spinner Mock Debug', () => {
  test('renders with size attribute', () => {
    render(<Spinner size="sm" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-size', 'sm');
  });

  test('renders with spinnerSize attribute', () => {
    render(<Spinner spinnerSize="lg" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    expect(spinner).toHaveAttribute('data-size', 'lg');
  });

  test('renders with both size and spinnerSize', () => {
    render(<Spinner size="md" spinnerSize="xl" />);
    
    const spinner = screen.getByTestId('chakra-spinner');
    // Should use size over spinnerSize
    expect(spinner).toHaveAttribute('data-size', 'md');
  });
});
