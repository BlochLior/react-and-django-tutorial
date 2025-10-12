# React Query Cache Key Fix - Critical Bug Resolution

## 🐛 The Problem

### **Cache Collision Between Components**
Multiple components were sharing the same React Query cache key, causing them to serve each other's cached data instead of making fresh API calls.

**Symptoms:**
- Review page shows "No questions available" after visiting Results page
- Results page shows "No results to display" after visiting Review page
- Data only loads correctly after manual page refresh
- Navigation between pages serves stale/wrong cached data

**Root Cause:**
All queries using anonymous arrow functions were generating the same cache key:
```javascript
const queryKey = ['query', 'anonymous', []];
```

React Query saw all these as the **same query** and served cached data from whichever page was visited first.

## ✅ The Solution

### **Unique Cache Keys for Every Query**

Added unique string identifiers to the dependencies array for each `useQuery` call:

```javascript
// ❌ BEFORE: All had generic keys
useQuery(queryFn, [], {...})  // Key: ['query', 'anonymous', []]
useQuery(queryFn, [], {...})  // Key: ['query', 'anonymous', []]
                              // ↑ SAME KEY = CACHE COLLISION!

// ✅ AFTER: Each has unique key
useQuery(queryFn, ['results-summary'], {...})     // Unique!
useQuery(queryFn, ['user-votes-review'], {...})   // Unique!
useQuery(queryFn, ['admin-dashboard', page], {...}) // Unique!
```

## 📝 Complete Implementation

### **All Components Updated:**

#### **1. ResultsSummary.jsx**
```javascript
useQuery(
  getResultsSummaryQuery,
  ['results-summary'],  // ✅ Unique identifier
  { 
    errorMessage: 'Failed to fetch poll results.',
    refetchOnMount: true
  }
);
```

#### **2. UserVotesReviewPage.jsx**
```javascript
useQuery(
  async () => pollsApi.getUserVotes(),
  ['user-votes-review'],  // ✅ Unique identifier
  {
    errorMessage: 'Failed to fetch your votes.',
    refetchOnMount: true
  }
);
```

#### **3. PollsContainer.jsx** (3 queries)
```javascript
// Query 1: Paginated polls
useQuery(
  getPollsQuery,
  ['polls-paginated', currentPage],  // ✅ Unique with page number
  { errorMessage: 'Failed to fetch polls.', onSuccess: onPollsSuccess }
);

// Query 2: User votes for pre-loading
useQuery(
  async () => pollsApi.getUserVotes(),
  ['user-votes-polls-container'],  // ✅ Unique identifier
  { 
    errorMessage: 'Failed to fetch your previous votes.',
    enabled: true,
    refetchOnMount: true
  }
);

// Query 3: All polls for review mode
useQuery(
  getAllPollsQuery,
  ['all-polls-for-review'],  // ✅ Unique identifier
  { 
    errorMessage: 'Failed to fetch all polls for review.',
    enabled: false
  }
);
```

#### **4. AdminDashboard.jsx**
```javascript
useQuery(
  getQuestionsQuery,
  ['admin-dashboard', currentPage],  // ✅ Unique with page number
  {
    errorMessage: 'Failed to fetch questions.',
    onSuccess: onSuccessCallback,
    refetchOnMount: true
  }
);
```

#### **5. QuestionDetail.jsx**
```javascript
useQuery(
  getQuestionQuery,
  ['question-detail', questionId],  // ✅ Unique with question ID
  { 
    errorMessage: 'Failed to fetch question details.',
    refetchOnMount: true
  }
);
```

## 🎯 Naming Convention

### **Established Pattern:**
```javascript
// Format: ['component-purpose', ...dynamicParams]

// Static queries (no params):
['results-summary']
['user-votes-review']

// Dynamic queries (with params):
['admin-dashboard', currentPage]
['question-detail', questionId]
['polls-paginated', currentPage]

// Multiple queries in one component:
['user-votes-polls-container']    // Query 1
['all-polls-for-review']          // Query 2
['polls-paginated', currentPage]  // Query 3
```

### **Best Practices:**
1. **Descriptive names** - Clearly identify what data is being fetched
2. **Include dynamic params** - Page numbers, IDs, etc.
3. **Component-specific prefixes** - Avoid collisions between components
4. **Consistent naming** - Use kebab-case for readability

## 🧪 Testing

### **Manual Test Checklist:**
- [x] Navigate Review → Results → Should load correctly ✅
- [x] Navigate Results → Review → Should load correctly ✅
- [x] Navigate Home → Review → Results → Review → All work ✅
- [x] Admin Dashboard → Question Detail → Dashboard → All work ✅
- [ ] Verify all pages load fresh data on mount

### **How to Verify:**
Check browser console for API calls:
```
API Service: Fetching results summary from /admin/summary/
API Service: Results summary response: {...}
```

If you see these logs, the cache is working correctly!

## 🎉 Benefits

### Before Fix:
- ❌ Cache collisions between pages
- ❌ Stale data served
- ❌ Required manual page refresh
- ❌ Confusing user experience

### After Fix:
- ✅ Each component has its own cache
- ✅ Fresh data loads on navigation
- ✅ No manual refresh needed
- ✅ Smooth navigation between pages
- ✅ Proper React Query cache management

## 📚 Files Modified

### Frontend Components:
1. `frontend-react/src/pages/admin/ResultsSummary.jsx`
2. `frontend-react/src/pages/client/UserVotesReviewPage.jsx`
3. `frontend-react/src/pages/client/PollsContainer.jsx`
4. `frontend-react/src/pages/admin/AdminDashboard.jsx`
5. `frontend-react/src/pages/admin/QuestionDetail.jsx`

### Documentation:
- `KNOWN_ISSUES.md` - Can now mark cache issue as resolved
- This file - Comprehensive cache key documentation

## 🔮 Future Improvements

### Consider:
1. **Centralized query keys** - Create constants file for all cache keys
2. **Cache invalidation** - Invalidate related caches when data changes
3. **Cache time configuration** - Set appropriate stale times
4. **Global cache config** - Configure React Query defaults

### Example Pattern:
```javascript
// constants/queryKeys.js
export const QUERY_KEYS = {
  RESULTS_SUMMARY: ['results-summary'],
  USER_VOTES_REVIEW: ['user-votes-review'],
  ADMIN_DASHBOARD: (page) => ['admin-dashboard', page],
  QUESTION_DETAIL: (id) => ['question-detail', id],
  POLLS_PAGINATED: (page) => ['polls-paginated', page],
  // ... etc
};

// Usage:
useQuery(queryFn, QUERY_KEYS.RESULTS_SUMMARY, {...})
useQuery(queryFn, QUERY_KEYS.ADMIN_DASHBOARD(currentPage), {...})
```

## 📖 Learning

### **Key Takeaways:**
1. **React Query needs unique keys** - Never use generic dependencies like `[]`
2. **Anonymous functions** - All get the same name, causing collisions
3. **Always include identifiers** - Even if you think you only have one query
4. **Test navigation paths** - Cache issues appear when moving between pages
5. **Debug with logs** - Console logging helps identify cache vs API issues

---

**Fixed Date:** October 4, 2025  
**Status:** ✅ Resolved - All components have unique cache keys  
**Impact:** Critical - Fixed navigation between Review and Results pages  
**Related:** KNOWN_ISSUES.md Issue #1

