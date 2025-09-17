# Test Refactoring Template

This template provides a systematic approach to refactor test files to maximize usage of centralized test utilities from the src/test-utils/ directory.

## Refactoring Goals
1. Replace hardcoded data with test data factories and TEST_SCENARIOS
2. Use centralized mock functions and render utilities
3. Create custom assertion helpers for component-specific patterns
4. Focus on testing custom features rather than library functionality
5. Add proper test isolation and edge case coverage
6. Remove redundant code and improve maintainability

## Available Test-Utils
- **test-data.js**: `createQuestion`, `createQuestions`, `createFormData`, `TEST_SCENARIOS`, `createMutationData`, `createMutationVariables`, `createChoice`, `createSelectedAnswers`
- **test-helpers.js**: `fillForm`, `submitForm`, `addChoices`, `createUserEvent`, `assertFormElements`, `assertEditFormElements`, `waitForElement`, `assertPaginationElements`, `assertPaginationNavigationStates`, `assertPaginationPageNumbers`, `assertPaginationInteractions`, `assertPaginationPageClick`, `assertAdminQuestionListElements`, `assertQuestionCardElements`, `assertQuestionListElements`, `waitForUseMutationReady`, `assertUseQuerySuccessState`, `assertUseQueryErrorState`, `assertTextContent`
- **mocks.js**: `createMockPollsQuery`, `createMockAllPollsQuery`, `createMockMutation`, `createMockQueryFn`, `createMockQueryFnWithSequence`, `createMockQueryFnWithErrorSequence`, `mockLocalStorage`, `mockSessionStorage`, `resetMocks`, `setupCommonMocks`
- **index.js**: `render`, `renderWithProviders`, `renderWithRouter`, `QueryWrapper`, `QueryRouterWrapper`, `QueryChakraRouterWrapper`, `createTestQueryClient`, `cleanup`

## Key Refactoring Strategies

### 1. Import Strategy
- Import all utilities from centralized `index.js` in a single import statement
- Include `cleanup` for proper test isolation
- Check usage with grep before importing to avoid unused imports
- Remove unused imports after refactoring (e.g., `screen` if using assertion helpers)

### 2. Mock Data Strategy
- Use `TEST_SCENARIOS` for consistent test data across multiple tests
- Create component-specific test scenarios in `test-data.js`
- Use factory functions with overrides for test-specific data needs
- Include mock functions in test scenarios (e.g., `onPageChange: jest.fn()`)

### 3. Test Structure
- Group tests by custom features: "Default Rendering", "Custom [Feature]", "Edge Cases", "Boundary Conditions"
- Use `beforeEach(() => cleanup())` for proper test isolation
- Focus on testable behaviors rather than implementation details
- Use descriptive test names that explain the behavior being tested

### 4. Component-Specific Assertion Helpers
- Create helpers in `test-helpers.js` following pattern: `assert[ComponentName][Behavior]()`
- Use centralized `assertTextContent()` for text content with whitespace handling
- Document with JSDoc comments including parameter descriptions
- Include both positive and negative assertions
- Group related assertions into single helper functions for better maintainability

### 5. Common Pitfalls to Avoid
- Don't manually call `setupCommonMocks()` or `resetMocks()` - handled globally
- Add `cleanup()` between multiple renders in the same test
- Don't test library functionality - focus on custom features
- Use `data-testid` for reliable element selection
- Leverage existing utilities like `assertTextContent()` for whitespace handling
- Don't import `screen` if using centralized assertion helpers
- Ensure mock functions are properly reset between tests
- **IMPORTANT**: Always import `waitFor` from test-utils if using async assertions
- Use `renderComponent()` helper function for consistent component rendering
- Group related test scenarios in `TEST_SCENARIOS` with descriptive names

## Refactoring Process
1. Analyze current test file and identify custom features to test
2. Create component-specific assertion helpers in `test-helpers.js`
3. Add component-specific test scenarios to `test-data.js`
4. Replace imports with centralized utilities from `index.js`
5. Replace hardcoded data with test data factories and `TEST_SCENARIOS`
6. Restructure tests into logical groups with `describe()` blocks
7. Add edge case testing and proper test isolation
8. Validate by running tests and checking for linting errors
9. Remove unused imports and helper functions
10. Update template with lessons learned from each refactoring

## Component-Specific Guidelines

### For UI Components (like Pagination, LoadingState, ErrorState)
- Focus on rendering states, user interactions, and edge cases
- Create assertion helpers for component-specific behaviors
- Test custom logic (e.g., smart pagination, conditional rendering)
- Use `TEST_SCENARIOS` for different component states

### For Page Components (like AdminDashboard)
- Focus on data loading states, error handling, and conditional rendering
- Mock external dependencies (hooks, child components)
- Test integration between components and data flow
- Use existing `assertUseQuerySuccessState`, `assertUseQueryErrorState` helpers

### For Hook Components
- Focus on hook behavior, state changes, and side effects
- Mock external dependencies and API calls
- Test error handling and edge cases
- Use existing mutation and query assertion helpers

### For Results/Summary Components (like ResultsSummary)
- Focus on data display, statistics calculation, and result formatting
- Mock complex utility functions and external dependencies
- Test different data states (empty, populated, error)
- Create assertion helpers for result-specific elements and calculations
- Use `TEST_SCENARIOS` for different summary data configurations

## Example Refactored Test Structure

### UI Component Example (Pagination)
```javascript
import React from 'react';
import { 
  render, 
  cleanup,
  TEST_SCENARIOS,
  assertPaginationElements,
  assertPaginationNavigationStates,
  assertPaginationInteractions
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
    });
  });

  describe('User Interactions', () => {
    test('calls onPageChange with correct page numbers', async () => {
      const scenario = TEST_SCENARIOS.PAGINATION_MIDDLE_PAGE;
      renderPagination(scenario);
      
      await assertPaginationInteractions(
        scenario.onPageChange, 
        scenario.currentPage, 
        scenario.hasPrevious, 
        scenario.hasNext
      );
    });
  });
});
```

### Page Component Example (AdminDashboard)
```javascript
import React from 'react';
import { 
  render, 
  cleanup,
  waitFor,
  TEST_SCENARIOS,
  assertAdminDashboardLoadingState,
  assertAdminDashboardSuccessState,
  assertAdminDashboardErrorState,
  assertAdminDashboardEmptyState,
  assertAdminDashboardStatistics
} from '../../test-utils';
import AdminDashboard from './AdminDashboard';

describe('AdminDashboard', () => {
  let mockUseQuery;
  
  beforeEach(() => {
    cleanup();
    mockUseQuery = require('../../hooks/useQuery').default;
    mockUseQuery.mockReset();
  });

  const renderAdminDashboard = () => {
    return render(<AdminDashboard />);
  };

  describe('Data Loading States', () => {
    test('renders loading state initially', () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_LOADING;
      mockUseQuery.mockReturnValue(scenario);
      
      renderAdminDashboard();
      assertAdminDashboardLoadingState();
    });

    test('renders questions after successful API fetch', () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_SUCCESS;
      mockUseQuery.mockReturnValue(scenario);
      
      renderAdminDashboard();
      assertAdminDashboardSuccessState(scenario.data);
    });
  });

  describe('Statistics Display', () => {
    test('displays correct statistics when questions are loaded', async () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_WITH_STATS;
      
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        if (options?.onSuccess) {
          setTimeout(() => options.onSuccess(scenario.data), 0);
        }
        return {
          data: scenario.data,
          loading: false,
          error: null
        };
      });
      
      renderAdminDashboard();
      
      await waitFor(() => {
        assertAdminDashboardStatistics(scenario.data.count);
      });
    });
  });
});
```

Please analyze the current test file and refactor it following this strategy while maintaining all existing test functionality. Focus on testing your custom features rather than library functionality.
