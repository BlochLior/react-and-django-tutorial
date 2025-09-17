import { renderHook, cleanup } from '@testing-library/react';
import usePageTitle from './usePageTitle';
import { 
  assertPageTitle, 
  assertPageTitleRestoration, 
  assertMultiplePageTitleHandling, 
  assertPageTitleTypeCoercion 
} from '../test-utils';

describe('usePageTitle', () => {
  let originalTitle;

  beforeEach(() => {
    // Store the original document title
    originalTitle = document.title;
    // Set a known initial title for testing
    document.title = 'Original Title';
    // Clean up any DOM pollution from previous tests
    cleanup();
  });

  afterEach(() => {
    // Restore the original title after each test
    document.title = originalTitle;
    // Clean up any DOM pollution
    cleanup();
  });

  describe('Custom Title Management', () => {
    test('should set the page title when hook is called', () => {
      const newTitle = 'New Page Title';
      
      renderHook(() => usePageTitle(newTitle));
      
      assertPageTitle(newTitle);
    });

    test('should update title when hook is re-rendered with new title', () => {
      const { rerender } = renderHook(
        ({ title }) => usePageTitle(title),
        { initialProps: { title: 'First Title' } }
      );
      
      assertPageTitle('First Title');
      
      rerender({ title: 'Second Title' });
      
      assertPageTitle('Second Title');
    });

    test('should handle empty string title', () => {
      renderHook(() => usePageTitle(''));
      
      assertPageTitle('');
    });
  });

  describe('Custom Title Restoration', () => {
    test('should restore original title when component unmounts', () => {
      const testTitle = 'Test Page Title';
      
      assertPageTitleRestoration(renderHook, testTitle, 'Original Title');
    });

    test('should restore title from when hook was first called', () => {
      // Change title before hook is called
      document.title = 'Intermediate Title';
      
      const testTitle = 'Test Page Title';
      
      assertPageTitleRestoration(renderHook, testTitle, 'Intermediate Title');
    });

    test('should handle multiple unmounts gracefully', () => {
      const testTitle = 'Test Page Title';
      
      const { unmount } = renderHook(() => usePageTitle(testTitle));
      
      assertPageTitle(testTitle);
      
      // First unmount
      unmount();
      assertPageTitle('Original Title');
      
      // Second unmount should not cause errors
      unmount();
      assertPageTitle('Original Title');
    });
  });

  describe('Custom Multiple Instance Handling', () => {
    test('should handle multiple hooks with different titles', () => {
      const title1 = 'First Hook Title';
      const title2 = 'Second Hook Title';
      
      assertMultiplePageTitleHandling(renderHook, title1, title2, 'Original Title');
    });

    test('should handle nested hook usage', () => {
      const outerTitle = 'Outer Title';
      const innerTitle = 'Inner Title';
      
      assertMultiplePageTitleHandling(renderHook, outerTitle, innerTitle, 'Original Title');
    });
  });

  describe('Custom Type Coercion Handling', () => {
    test('should handle null values', () => {
      assertPageTitleTypeCoercion(renderHook, null, 'null');
    });

    test('should handle undefined values', () => {
      assertPageTitleTypeCoercion(renderHook, undefined, 'undefined');
    });

    test('should handle number values', () => {
      assertPageTitleTypeCoercion(renderHook, 123, '123');
    });

    test('should handle boolean values', () => {
      assertPageTitleTypeCoercion(renderHook, true, 'true');
    });

    test('should handle object values', () => {
      assertPageTitleTypeCoercion(renderHook, { key: 'value' }, '[object Object]');
    });
  });

  describe('Custom Performance Features', () => {
    test('should handle multiple instances with proper restoration order', () => {
      const hooks = [];
      
      // Create many hook instances
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => usePageTitle(`Title ${i}`));
        hooks.push({ result, unmount });
      }
      
      // Last hook should win
      assertPageTitle('Title 9');
      
      // Clean up all hooks in reverse order (last in, first out)
      // This ensures each hook restores to the title that was active when it was created
      hooks.reverse().forEach(({ unmount }) => {
        unmount();
      });
      
      // After unmounting all hooks, we should be back to the title that was active
      // when the first hook was created, which was 'Original Title'
      assertPageTitle('Original Title');
    });

    test('should handle rapid title changes efficiently', () => {
      const { rerender } = renderHook(
        ({ title }) => usePageTitle(title),
        { initialProps: { title: 'Initial' } }
      );
      
      // Rapidly change titles
      for (let i = 0; i < 50; i++) {
        rerender({ title: `Title ${i}` });
      }
      
      assertPageTitle('Title 49');
    });
  });
});
