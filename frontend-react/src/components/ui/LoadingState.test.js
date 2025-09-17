import React from 'react';
import { 
  render, 
  screen, 
  cleanup,
  TEST_SCENARIOS,
  assertLoadingStateElements,
  assertLoadingStateSpinnerProps,
  assertLoadingStateNoMessage,
  assertLoadingStateMessageHandling,
  assertLoadingStateCustomProps,
  assertLoadingStateLayout
} from '../../test-utils';
import LoadingState from './LoadingState';

describe('LoadingState', () => {
  // Test isolation - cleanup after each test
  beforeEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) => {
    return render(<LoadingState {...props} />);
  };

  describe('Default Rendering', () => {
    test('renders with default configuration', () => {
      renderComponent();
      
      assertLoadingStateElements(TEST_SCENARIOS.LOADING_STATE_DEFAULT.message);
      assertLoadingStateSpinnerProps(
        TEST_SCENARIOS.LOADING_STATE_DEFAULT.spinnerSize,
        TEST_SCENARIOS.LOADING_STATE_DEFAULT.spinnerColor,
        TEST_SCENARIOS.LOADING_STATE_DEFAULT.spinnerThickness
      );
    });

    test('maintains proper layout structure', () => {
      renderComponent();
      
      assertLoadingStateLayout();
    });
  });

  describe('Custom Message Handling', () => {
    test('renders with custom message', () => {
      const scenario = TEST_SCENARIOS.LOADING_STATE_CUSTOM_MESSAGE;
      renderComponent({ message: scenario.message });
      
      assertLoadingStateMessageHandling(scenario.message, true);
    });

    test('renders without message when message is empty string', () => {
      renderComponent(TEST_SCENARIOS.LOADING_STATE_NO_MESSAGE);
      
      assertLoadingStateNoMessage();
    });

    test('renders without message when message is null', () => {
      renderComponent(TEST_SCENARIOS.LOADING_STATE_NULL_MESSAGE);
      
      assertLoadingStateNoMessage();
    });

    test('renders with default message when message is undefined', () => {
      renderComponent(TEST_SCENARIOS.LOADING_STATE_UNDEFINED_MESSAGE);
      
      // When message is undefined, it defaults to 'Loading...'
      assertLoadingStateMessageHandling('Loading...', true);
    });
  });

  describe('Spinner Customization', () => {
    test('renders with custom spinner size', () => {
      const scenario = TEST_SCENARIOS.LOADING_STATE_CUSTOM_SPINNER;
      renderComponent({ spinnerSize: scenario.spinnerSize });
      
      assertLoadingStateSpinnerProps(scenario.spinnerSize);
    });

    test('renders with custom spinner color', () => {
      const scenario = TEST_SCENARIOS.LOADING_STATE_CUSTOM_SPINNER;
      renderComponent({ spinnerColor: scenario.spinnerColor });
      
      assertLoadingStateSpinnerProps('xl', scenario.spinnerColor);
    });

    test('renders with custom spinner thickness', () => {
      const scenario = TEST_SCENARIOS.LOADING_STATE_CUSTOM_SPINNER;
      renderComponent({ spinnerThickness: scenario.spinnerThickness });
      
      assertLoadingStateSpinnerProps('xl', 'teal.500', scenario.spinnerThickness);
    });

    test('renders with all custom props', () => {
      const scenario = TEST_SCENARIOS.LOADING_STATE_ALL_CUSTOM;
      renderComponent(scenario);
      
      assertLoadingStateCustomProps(
        scenario.message,
        scenario.spinnerSize,
        scenario.spinnerColor,
        scenario.spinnerThickness
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles whitespace-only message', () => {
      renderComponent({ message: '   ' });
      
      // Should render the whitespace message
      assertLoadingStateMessageHandling('   ', true);
    });

    test('handles very long message', () => {
      const longMessage = 'This is a very long loading message that should still be displayed correctly without breaking the layout or causing any issues with the component rendering';
      renderComponent({ message: longMessage });
      
      assertLoadingStateMessageHandling(longMessage, true);
    });

    test('handles special characters in message', () => {
      const specialMessage = 'Loading... 🚀 with special chars: @#$%^&*()';
      renderComponent({ message: specialMessage });
      
      assertLoadingStateMessageHandling(specialMessage, true);
    });
  });

  describe('Boundary Conditions', () => {
    test('handles extreme spinner sizes', () => {
      renderComponent({ spinnerSize: 'xs' });
      assertLoadingStateSpinnerProps('xs');
      
      cleanup();
      
      renderComponent({ spinnerSize: 'xl' });
      assertLoadingStateSpinnerProps('xl');
    });

    test('handles extreme spinner thickness values', () => {
      renderComponent({ spinnerThickness: '1px' });
      assertLoadingStateSpinnerProps('xl', 'teal.500', '1px');
      
      cleanup();
      
      renderComponent({ spinnerThickness: '20px' });
      assertLoadingStateSpinnerProps('xl', 'teal.500', '20px');
    });

    test('handles invalid color values gracefully', () => {
      renderComponent({ spinnerColor: 'invalid-color' });
      
      // Should still render the component even with invalid color
      assertLoadingStateElements();
      expect(screen.getByTestId('chakra-spinner')).toBeInTheDocument();
    });
  });
});

