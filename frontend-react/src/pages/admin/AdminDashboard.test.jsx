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

// Mock the useQuery hook to control its behavior in tests
jest.mock('../../hooks/useQuery', () => {
  const originalModule = jest.requireActual('../../hooks/useQuery');
  return {
    ...originalModule,
    __esModule: true,
    default: jest.fn()
  };
});

// Mock child components to isolate the test
jest.mock('../../components/admin/AdminQuestionList', () => () => <div data-testid="admin-question-list" />);

describe('AdminDashboard', () => {
  let mockUseQuery;
  
  beforeEach(() => {
    cleanup();
    // Set up the mock for each test
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

    test('renders error message on API fetch failure', () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_ERROR;
      mockUseQuery.mockReturnValue(scenario);
      
      renderAdminDashboard();
      assertAdminDashboardErrorState(scenario.error);
    });

    test('renders empty state when API returns no questions', () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_EMPTY;
      mockUseQuery.mockReturnValue(scenario);
      
      renderAdminDashboard();
      assertAdminDashboardEmptyState();
    });
  });

  describe('Statistics Display', () => {
    test('displays correct statistics when questions are loaded', async () => {
      const scenario = TEST_SCENARIOS.ADMIN_DASHBOARD_WITH_STATS;
      
      // Mock the useQuery hook to return success state and trigger onSuccess callback
      mockUseQuery.mockImplementation((queryFn, deps, options) => {
        // Simulate the onSuccess callback being called
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
      
      // Wait for the onSuccess callback to be triggered
      await waitFor(() => {
        assertAdminDashboardStatistics(scenario.data.count);
      });
    });
  });
});