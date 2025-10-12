# Known Issues & Future Improvements

This document tracks known issues, technical debt, and planned improvements for the polling application.

## 🔄 Caching Issues

### **Issue #1: React Query Cache Key Collisions** ✅ RESOLVED
**Priority:** Critical (was causing major navigation issues)  
**Status:** ✅ **RESOLVED** - October 4, 2025  
**Discovered:** October 4, 2025  
**Fixed:** October 4, 2025

**Description:**
Multiple components were sharing the same React Query cache key, causing them to serve each other's cached data instead of making fresh API calls. This resulted in:
- Review page showing "No questions available" after visiting Results page
- Results page showing "No results to display" after visiting Review page
- Requiring manual page refresh to see correct data

**Root Cause:**
All queries using anonymous arrow functions were generating the same cache key `['query', 'anonymous', []]`, causing React Query to treat them as the same query and serve cached data.

**Solution Implemented:**
Added unique string identifiers to each `useQuery` call's dependencies array:
- `ResultsSummary`: `['results-summary']`
- `UserVotesReviewPage`: `['user-votes-review']`
- `PollsContainer`: `['polls-paginated', page]`, `['user-votes-polls-container']`, `['all-polls-for-review']`
- `AdminDashboard`: `['admin-dashboard', page]`
- `QuestionDetail`: `['question-detail', id]`

**Documentation:**
See `CACHE_KEY_FIX_SUMMARY.md` for complete details and best practices.

---

### **Issue #2: Stale Vote Cache After Deletion**
**Priority:** Low  
**Status:** Known behavior, not breaking functionality  
**Discovered:** October 4, 2025

**Description:**
When a user deletes all their votes from the Review page and immediately navigates back to the Polls page, the frontend may briefly display their previously selected answers in local component state (even though they've been deleted from the backend).

**Root Cause:**
The `PollsContainer` component caches user votes in local component state with an `initialAnswersLoaded` flag that prevents refetching during the same session. When votes are deleted via the Review page, the Polls page component doesn't know to invalidate its local state cache.

**Current Behavior:**
- Refreshing the page clears the local state cache
- The issue only affects the immediate return to polls after deletion
- Submitting new votes works correctly despite the stale local state
- The backend is always correct - this is purely a frontend display issue

**Impact:**
- **User Experience:** Minimal - Only affects edge case of immediate return after deletion
- **Functionality:** No data corruption - Backend is correct, only frontend display is stale
- **Data Integrity:** Not affected - Submissions work correctly

**Recommended Fix Timeline:**
- Phase 4-5 improvements when implementing broader cache management strategy
- Consider during global state management refactoring if planned

---

## 🧪 Test Infrastructure Issues

### **Issue #2: Flaky Form Interaction Test**
**Priority:** Low (Fixed with timeout increase)  
**Status:** Resolved with workaround  
**Discovered:** October 4, 2025

**Description:**
The test "allows user to fill out the form with valid data" in `NewQuestion.test.jsx` was occasionally timing out. The test takes 1.5-2 seconds to complete due to multiple async user interactions (typing, clicking, form validation).

**Solution Applied:**
Increased test timeout from default 5000ms to 10000ms for this specific test.

**Root Cause:**
Form interactions with `@testing-library/user-event` involve many async operations:
- React re-renders after each keystroke
- Form validation on each change
- State updates
- Date picker interactions

**Code Location:**
```javascript
// NewQuestion.test.jsx line 129
test('allows user to fill out the form with valid data', async () => {
  // ... test code ...
}, 10000); // Increased timeout
```

---

## 📝 Future Improvements Tracker

### Testing
- [ ] Write automated tests for vote deletion flow
- [ ] Test cache behavior across different navigation paths
- [ ] Add E2E tests for complete user journeys
- [ ] Consider optimizing slow form interaction tests

### Performance
- [ ] Consider implementing global state management (React Query context)
- [ ] Optimize vote fetching to reduce duplicate API calls
- [ ] Implement proper cache invalidation strategy

### User Experience
- [ ] Add loading transitions between pages
- [ ] Show toast notifications for successful actions
- [ ] Add confirmation messages after vote deletion

---

## 🔧 Technical Debt

### Code Organization
- [ ] Centralize cache management logic
- [ ] Create unified data fetching strategy
- [ ] Document caching patterns in ARCHITECTURE.md

### Consistency
- [ ] Standardize on React Query vs custom hooks
- [ ] Implement consistent error handling patterns
- [ ] Unified loading state management

---

**Last Updated:** October 4, 2025  
**Next Review:** During Phase 2-3 implementation

