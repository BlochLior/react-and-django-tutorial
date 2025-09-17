import React from 'react';
import { 
  render, 
  screen,
  cleanup,
  assertErrorStateElements,
  assertErrorStateNotRendered,
  assertErrorStateMessageHandling,
  assertErrorStateCustomProps,
  TEST_SCENARIOS
} from '../../test-utils';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  // Add proper test isolation
  beforeEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) => {
    return render(<ErrorState {...props} />);
  };

  describe('Custom Message Handling', () => {
    test('renders error message when message prop is provided', () => {
      const { message } = TEST_SCENARIOS.ERROR_STATE_BASIC;
      renderComponent({ message });
      
      assertErrorStateElements(message);
    });

    test('renders title when title prop is provided', () => {
      const { message, title } = TEST_SCENARIOS.ERROR_STATE_WITH_TITLE;
      renderComponent({ message, title });
      
      assertErrorStateElements(message, title);
    });

    test('does not render title when title prop is not provided', () => {
      const { message } = TEST_SCENARIOS.ERROR_STATE_BASIC;
      renderComponent({ message });
      
      assertErrorStateElements(message);
      expect(screen.queryByText('Error Title')).not.toBeInTheDocument();
    });
  });

  describe('Custom Falsy Message Handling', () => {
    test.each([
      ['empty string', TEST_SCENARIOS.ERROR_STATE_EMPTY.message],
      ['null', TEST_SCENARIOS.ERROR_STATE_NULL.message],
      ['undefined', TEST_SCENARIOS.ERROR_STATE_UNDEFINED.message],
      ['no props', undefined]
    ])('renders nothing when message is %s', (_, message) => {
      renderComponent(message !== undefined ? { message } : {});
      
      assertErrorStateNotRendered();
    });
  });

  describe('Custom Status and Variant Handling', () => {
    test('renders with custom status prop', () => {
      const { message, status } = TEST_SCENARIOS.ERROR_STATE_WARNING;
      renderComponent({ message, status });
      
      assertErrorStateCustomProps(message, null, status, 'subtle');
    });

    test('renders with custom variant prop', () => {
      const { message, status, variant } = TEST_SCENARIOS.ERROR_STATE_INFO;
      renderComponent({ message, status, variant });
      
      assertErrorStateCustomProps(message, null, status, variant);
    });

    test('renders with custom status and variant combination', () => {
      const { message, title, status, variant } = TEST_SCENARIOS.ERROR_STATE_SUCCESS;
      renderComponent({ message, title, status, variant });
      
      assertErrorStateCustomProps(message, title, status, variant);
    });

    test('renders with default props when only message is provided', () => {
      const { message } = TEST_SCENARIOS.ERROR_STATE_BASIC;
      renderComponent({ message });
      
      // Should use default status 'error' and variant 'subtle'
      assertErrorStateCustomProps(message, null, 'error', 'subtle');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('handles very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      renderComponent({ message: longMessage });
      
      assertErrorStateMessageHandling(longMessage, true);
    });

    test('handles special characters in message', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      renderComponent({ message: specialMessage });
      
      assertErrorStateMessageHandling(specialMessage, true);
    });

    test('handles HTML-like content in message', () => {
      const htmlMessage = 'Error with <script>alert("test")</script> content';
      renderComponent({ message: htmlMessage });
      
      assertErrorStateMessageHandling(htmlMessage, true);
    });

    test('handles whitespace-only message', () => {
      const whitespaceMessage = '   \n\t   ';
      renderComponent({ message: whitespaceMessage });
      
      // Should render because whitespace is truthy
      assertErrorStateMessageHandling(whitespaceMessage, true);
    });
  });
});
