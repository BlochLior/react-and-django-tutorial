# Test Refactoring Template

I want to refactor my test file: `[FILE_PATH]` to maximize usage of centralized test utilities from the `test-utils/` directory.

## Refactoring Goals
1. Replace hardcoded data with test data factories and TEST_SCENARIOS
2. Use centralized mock functions and render utilities
3. Create custom assertion helpers for component-specific patterns
4. Focus on testing custom features rather than library functionality
5. Add proper test isolation and edge case coverage

## Available Test-Utils
- **test-data.js**: `createQuestion`, `createQuestions`, `createFormData`, `TEST_SCENARIOS`, `createMutationData`, `createMutationVariables`
- **test-helpers.js**: `fillForm`, `submitForm`, `addChoices`, `createUserEvent`, `assertFormElements`, `assertEditFormElements`, `waitForElement`, `assertPaginationElements`, `assertAdminQuestionListElements`, `assertQuestionCardElements`, `assertQuestionListElements`, `waitForUseMutationReady`, `assertUseQuerySuccessState`, `assertUseQueryErrorState`, `assertTextContent`
- **mocks.js**: `createMockPollsQuery`, `createMockAllPollsQuery`, `createMockMutation`, `createMockQueryFn`, `setupCommonMocks`
- **index.js**: `render`, `QueryWrapper`, `QueryRouterWrapper`, `QueryChakraRouterWrapper`, `cleanup`

## Key Refactoring Strategies

### 1. Import Strategy
- Import all utilities from centralized `index.js` in a single import statement
- Include `cleanup` for proper test isolation
- Check usage with grep before importing to avoid unused imports

### 2. Mock Data Strategy
- Use `TEST_SCENARIOS` for consistent test data across multiple tests
- Create component-specific test scenarios in `test-data.js`
- Use factory functions with overrides for test-specific data needs

### 3. Test Structure
- Group tests by custom features: "Default Rendering", "Custom [Feature]", "Edge Cases", "Boundary Conditions"
- Use `beforeEach(() => cleanup())` for proper test isolation
- Focus on testable behaviors rather than implementation details

### 4. Component-Specific Assertion Helpers
- Create helpers in `test-helpers.js` following pattern: `assert[ComponentName][Behavior]()`
- Use centralized `assertTextContent()` for text content with whitespace handling
- Document with JSDoc comments
- Include both positive and negative assertions

### 5. Common Pitfalls to Avoid
- Don't manually call `setupCommonMocks()` or `resetMocks()` - handled globally
- Add `cleanup()` between multiple renders in the same test
- Don't test library functionality - focus on custom features
- Use `data-testid` for reliable element selection
- Leverage existing utilities like `assertTextContent()` for whitespace handling

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

## Example Refactored Test Structure
```javascript
import React from 'react';
import { 
  render, 
  screen, 
  cleanup,
  TEST_SCENARIOS,
  assertComponentElements,
  assertComponentCustomProps,
  assertTextContent
} from '../../test-utils';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) => {
    return render(<ComponentName {...props} />);
  };

  describe('Default Rendering', () => {
    test('renders with default configuration', () => {
      renderComponent();
      assertComponentElements(TEST_SCENARIOS.COMPONENT_DEFAULT.message);
    });
  });

  describe('Custom Features', () => {
    test('handles custom props', () => {
      const scenario = TEST_SCENARIOS.COMPONENT_CUSTOM;
      renderComponent(scenario);
      assertComponentCustomProps(scenario.message, scenario.otherProp);
    });
  });

  describe('Edge Cases', () => {
    test('handles whitespace-only content', () => {
      renderComponent({ message: '   ' });
      assertTextContent('   ', 'chakra-text');
    });
  });

  describe('Boundary Conditions', () => {
    test('handles extreme values', () => {
      renderComponent({ value: 'extreme' });
      // Test boundary behavior
    });
  });
});
```

Please analyze the current test file and refactor it following this strategy while maintaining all existing test functionality. Focus on testing your custom features rather than library functionality.
