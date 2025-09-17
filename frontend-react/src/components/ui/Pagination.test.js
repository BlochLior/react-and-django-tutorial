import React from 'react';
import { 
  render, 
  cleanup,
  TEST_SCENARIOS,
  assertPaginationElements,
  assertPaginationNavigationStates,
  assertPaginationPageNumbers,
  assertPaginationInteractions,
  assertPaginationPageClick
} from '../../test-utils';
import Pagination from './Pagination';

describe('Pagination', () => {
  beforeEach(() => {
    cleanup();
  });

  const renderPagination = (props = {}) => {
    return render(<Pagination {...props} />);
  };

  describe('Default Rendering', () => {
    test('renders with default configuration', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_DEFAULT;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
      assertPaginationPageNumbers(scenario.currentPage, scenario.totalPages);
    });

    test('renders with all controls enabled when not on first or last page', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_MIDDLE_PAGE;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
      assertPaginationPageNumbers(scenario.currentPage, scenario.totalPages);
    });
  });

  describe('Custom Navigation States', () => {
    test('disables "Previous" button on the first page', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_DEFAULT;
      renderPagination(scenario);
      
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
    });

    test('disables "Next" button on the last page', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_LAST_PAGE;
      renderPagination(scenario);
      
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
    });
  });

  describe('User Interactions', () => {
    test('calls onPageChange with correct page numbers when navigation buttons are clicked', async () => {
      const scenario = TEST_SCENARIOS.PAGINATION_MIDDLE_PAGE;
      renderPagination(scenario);
      
      await assertPaginationInteractions(
        scenario.onPageChange, 
        scenario.currentPage, 
        scenario.hasPrevious, 
        scenario.hasNext
      );
    });

    test('calls onPageChange when page number buttons are clicked', async () => {
      const scenario = TEST_SCENARIOS.PAGINATION_MIDDLE_PAGE;
      renderPagination(scenario);
      
      await assertPaginationPageClick(scenario.onPageChange, 4);
    });

    test('does not call onPageChange when disabled buttons are clicked', async () => {
      const scenario = TEST_SCENARIOS.PAGINATION_DEFAULT;
      renderPagination(scenario);
      
      await assertPaginationInteractions(
        scenario.onPageChange, 
        scenario.currentPage, 
        scenario.hasPrevious, 
        scenario.hasNext
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles single page scenario', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_SINGLE_PAGE;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
      assertPaginationPageNumbers(scenario.currentPage, scenario.totalPages);
    });

    test('handles large page numbers', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_LARGE_NUMBERS;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
    });
  });

  describe('Boundary Conditions', () => {
    test('handles early pages with smart pagination', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_EARLY_PAGES;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
    });

    test('handles late pages with smart pagination', () => {
      const scenario = TEST_SCENARIOS.PAGINATION_LATE_PAGES;
      renderPagination(scenario);
      
      assertPaginationElements(scenario.currentPage, scenario.totalPages);
      assertPaginationNavigationStates(scenario.hasPrevious, scenario.hasNext);
    });
  });
});