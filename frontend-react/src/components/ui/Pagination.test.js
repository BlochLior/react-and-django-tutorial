import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import { createUserEvent } from '../../test-utils/test-helpers';
import Pagination from './Pagination';

describe('Pagination', () => {
  const renderPagination = (props = {}) => {
    const defaultProps = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: jest.fn(),
      hasPrevious: false,
      hasNext: true,
    };
    
    return render(<Pagination {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    test('renders with all controls enabled when not on first or last page', () => {
      const mockOnPageChange = jest.fn();
      renderPagination({
        currentPage: 2,
        totalPages: 5,
        onPageChange: mockOnPageChange,
        hasPrevious: true,
        hasNext: true,
      });

      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    });

    test('disables "Previous" button on the first page', () => {
      renderPagination({
        currentPage: 1,
        hasPrevious: false,
        hasNext: true,
      });

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    });

    test('disables "Next" button on the last page', () => {
      renderPagination({
        currentPage: 5,
        totalPages: 5,
        hasPrevious: true,
        hasNext: false,
      });

      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    });
  });

  describe('User Interactions', () => {
    test('calls onPageChange with correct page numbers when buttons are clicked', async () => {
      const user = createUserEvent();
      const mockOnPageChange = jest.fn();
      renderPagination({
        currentPage: 3,
        totalPages: 5,
        onPageChange: mockOnPageChange,
        hasPrevious: true,
        hasNext: true,
      });
      
      // Click the 'Previous' button
      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
      
      // Click the 'Next' button
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    test('calls onPageChange when page number buttons are clicked', async () => {
      const user = createUserEvent();
      const mockOnPageChange = jest.fn();
      renderPagination({
        currentPage: 2,
        totalPages: 5,
        onPageChange: mockOnPageChange,
        hasPrevious: true,
        hasNext: true,
      });
      
      // Click on page 4 button
      await user.click(screen.getByRole('button', { name: '4' }));
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    test('does not call onPageChange when disabled buttons are clicked', async () => {
      const user = createUserEvent();
      const mockOnPageChange = jest.fn();
      renderPagination({
        currentPage: 1,
        onPageChange: mockOnPageChange,
        hasPrevious: false,
        hasNext: true,
      });
      
      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles single page', () => {
      renderPagination({
        currentPage: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      });

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    test('handles large page numbers', () => {
      renderPagination({
        currentPage: 100,
        totalPages: 1000,
        hasPrevious: true,
        hasNext: true,
      });

      expect(screen.getByText('Page 100 of 1000')).toBeInTheDocument();
    });
  });
});