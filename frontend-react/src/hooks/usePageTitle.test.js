import { renderHook } from '@testing-library/react';
import usePageTitle from './usePageTitle';

describe('usePageTitle', () => {
  let originalTitle;

  beforeEach(() => {
    // Store the original document title
    originalTitle = document.title;
    // Set a known initial title for testing
    document.title = 'Original Title';
  });

  afterEach(() => {
    // Restore the original title after each test
    document.title = originalTitle;
  });

  describe('Basic functionality', () => {
    test('should set the page title when hook is called', () => {
      const newTitle = 'New Page Title';
      
      renderHook(() => usePageTitle(newTitle));
      
      expect(document.title).toBe(newTitle);
    });

    test('should update title when hook is re-rendered with new title', () => {
      const { rerender } = renderHook(
        ({ title }) => usePageTitle(title),
        { initialProps: { title: 'First Title' } }
      );
      
      expect(document.title).toBe('First Title');
      
      rerender({ title: 'Second Title' });
      
      expect(document.title).toBe('Second Title');
    });

    test('should handle empty string title', () => {
      renderHook(() => usePageTitle(''));
      
      expect(document.title).toBe('');
    });

    test('should handle null title', () => {
      renderHook(() => usePageTitle(null));
      
      expect(document.title).toBe('null');
    });

    test('should handle undefined title', () => {
      renderHook(() => usePageTitle(undefined));
      
      expect(document.title).toBe('undefined');
    });
  });

  describe('Cleanup and restoration', () => {
    test('should restore original title when component unmounts', () => {
      const testTitle = 'Test Page Title';
      
      const { unmount } = renderHook(() => usePageTitle(testTitle));
      
      expect(document.title).toBe(testTitle);
      
      unmount();
      
      expect(document.title).toBe('Original Title');
    });

    test('should restore title from when hook was first called', () => {
      // Change title before hook is called
      document.title = 'Intermediate Title';
      
      const testTitle = 'Test Page Title';
      
      const { unmount } = renderHook(() => usePageTitle(testTitle));
      
      expect(document.title).toBe(testTitle);
      
      unmount();
      
      // Should restore to 'Intermediate Title', not 'Original Title'
      expect(document.title).toBe('Intermediate Title');
    });

    test('should handle multiple unmounts gracefully', () => {
      const testTitle = 'Test Page Title';
      
      const { unmount } = renderHook(() => usePageTitle(testTitle));
      
      expect(document.title).toBe(testTitle);
      
      // First unmount
      unmount();
      expect(document.title).toBe('Original Title');
      
      // Second unmount should not cause errors
      unmount();
      expect(document.title).toBe('Original Title');
    });
  });

  describe('Multiple instances', () => {
    test('should handle multiple hooks with different titles', () => {
      const title1 = 'First Hook Title';
      const title2 = 'Second Hook Title';
      
      const { unmount: unmount1 } = renderHook(() => usePageTitle(title1));
      const { unmount: unmount2 } = renderHook(() => usePageTitle(title2));
      
      // Last hook should win
      expect(document.title).toBe(title2);
      
      // Unmount second hook
      unmount2();
      expect(document.title).toBe(title1);
      
      // Unmount first hook
      unmount1();
      expect(document.title).toBe('Original Title');
    });

    test('should handle nested hook usage', () => {
      const outerTitle = 'Outer Title';
      const innerTitle = 'Inner Title';
      
      const { unmount: outerUnmount } = renderHook(() => usePageTitle(outerTitle));
      
      expect(document.title).toBe(outerTitle);
      
      const { unmount: innerUnmount } = renderHook(() => usePageTitle(innerTitle));
      
      expect(document.title).toBe(innerTitle);
      
      // Unmount inner hook first
      innerUnmount();
      expect(document.title).toBe(outerTitle);
      
      // Unmount outer hook
      outerUnmount();
      expect(document.title).toBe('Original Title');
    });
  });

  describe('Edge cases', () => {
    test('should handle very long titles', () => {
      const longTitle = 'A'.repeat(1000);
      
      renderHook(() => usePageTitle(longTitle));
      
      expect(document.title).toBe(longTitle);
    });

    test('should handle special characters in title', () => {
      const specialTitle = 'Title with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      renderHook(() => usePageTitle(specialTitle));
      
      expect(document.title).toBe(specialTitle);
    });

    test('should handle HTML entities in title', () => {
      const htmlTitle = 'Title with <script>alert("xss")</script>';
      
      renderHook(() => usePageTitle(htmlTitle));
      
      expect(document.title).toBe(htmlTitle);
    });

    test('should handle non-string values', () => {
      const numberTitle = 123;
      const booleanTitle = true;
      const objectTitle = { key: 'value' };
      
      renderHook(() => usePageTitle(numberTitle));
      expect(document.title).toBe('123');
      
      renderHook(() => usePageTitle(booleanTitle));
      expect(document.title).toBe('true');
      
      renderHook(() => usePageTitle(objectTitle));
      expect(document.title).toBe('[object Object]');
    });
  });

  describe('Performance and memory', () => {
    test('should not cause memory leaks with many instances', () => {
      const hooks = [];
      
      // Create many hook instances
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => usePageTitle(`Title ${i}`));
        hooks.push({ result, unmount });
      }
      
      // Last hook should win
      expect(document.title).toBe('Title 9');
      
      // Clean up all hooks in reverse order (last in, first out)
      // This ensures each hook restores to the title that was active when it was created
      hooks.reverse().forEach(({ unmount }) => unmount());
      
      // After unmounting all hooks, we should be back to the title that was active
      // when the first hook was created, which was 'Original Title'
      expect(document.title).toBe('Original Title');
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
      
      expect(document.title).toBe('Title 49');
    });
  });
});
