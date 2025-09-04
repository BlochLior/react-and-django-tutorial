import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  test('renders error message when message prop is provided', () => {
    const errorMessage = 'Something went wrong!';
    render(<ErrorState message={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders nothing when no message is provided', () => {
    render(<ErrorState message="" />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders nothing when message is null', () => {
    render(<ErrorState message={null} />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders nothing when message is undefined', () => {
    render(<ErrorState />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders title when title prop is provided', () => {
    const errorMessage = 'Something went wrong!';
    const errorTitle = 'Error Title';
    render(<ErrorState message={errorMessage} title={errorTitle} />);
    
    expect(screen.getByText(errorTitle)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('does not render title when title prop is not provided', () => {
    const errorMessage = 'Something went wrong!';
    render(<ErrorState message={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Error Title')).not.toBeInTheDocument();
  });

  test('renders with custom status prop', () => {
    const errorMessage = 'Warning message';
    render(<ErrorState message={errorMessage} status="warning" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  test('renders with custom variant prop', () => {
    const errorMessage = 'Info message';
    render(<ErrorState message={errorMessage} status="info" variant="solid" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  test('renders with default props when only message is provided', () => {
    const errorMessage = 'Default error message';
    render(<ErrorState message={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    // Should use default status 'error' and variant 'subtle'
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
