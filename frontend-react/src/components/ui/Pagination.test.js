import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

// Use of fireEvent: 
// A low-level API for simulating user interactions with the DOM.
// as such, no need for higher level interactions such as userEvent.

describe('Pagination', () => {
  // Test 1: Renders correctly with full controls
  test('renders with all controls enabled when not on first or last page', () => {
    const mockOnPageChange = jest.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
        hasPrevious={true}
        hasNext={true}
      />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  // Test 2: 'Previous' button is disabled on the first page
  test('disables "Previous" button on the first page', () => {
    const mockOnPageChange = jest.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        hasPrevious={false}
        hasNext={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  // Test 3: 'Next' button is disabled on the last page
  test('disables "Next" button on the last page', () => {
    const mockOnPageChange = jest.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
        hasPrevious={true}
        hasNext={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });
  
  // Test 4: Page change callback is triggered
  test('calls onPageChange with correct number when buttons are clicked', () => {
    const mockOnPageChange = jest.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
        hasPrevious={true}
        hasNext={true}
      />
    );
    
    // Click the 'Previous' button
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
    
    // Click the 'Next' button
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });
});